import { join } from "node:path"
import { existsSync } from "node:fs"
import { init, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { crawl } from "../scraper/crawler"
import { summarize } from "../scraper/summarizer"
import { discoverTemplates, pickRandomTemplate } from "../templates/registry"
import { copyTemplate } from "../templates/resolver"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import { GENERATE_SYSTEM_PROMPT, buildGenerateUserMessage } from "../llm/prompts"
import type { LLMProvider } from "../llm/provider"

function slugify(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/\./g, "-")
  } catch {
    throw new Error(`Invalid URL: "${url}"`)
  }
}

async function fillTemplate(
  siteDir: string,
  provider: LLMProvider,
  slots: { name: string; marker: string }[],
  businessData: object
): Promise<void> {
  console.log("  Filling template slots with business data...")
  const userMessage = buildGenerateUserMessage(slots, businessData)
  const response = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let fileMap: Record<string, string>
  try {
    const jsonStart = response.indexOf("{")
    const jsonEnd = response.lastIndexOf("}") + 1
    fileMap = JSON.parse(response.slice(jsonStart, jsonEnd))
  } catch {
    throw new Error("LLM returned malformed response — unable to parse file map")
  }

  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await Bun.write(fullPath, content)
    console.log(`    Wrote ${filePath}`)
  }
}

export async function generate(url: string, templateName?: string): Promise<void> {
  const slug = slugify(url)
  const siteDir = join(process.cwd(), "sites", slug)

  if (existsSync(siteDir)) {
    throw new Error(`Site "${slug}" already exists at sites/${slug}`)
  }

  console.log(`\n=== Generate: ${url} -> ${slug} ===\n`)

  const templatesRoot = join(process.cwd(), "templates")
  const templates = await discoverTemplates(templatesRoot)

  if (templates.length === 0) {
    throw new Error("No templates found in templates/ directory")
  }

  let template
  if (templateName) {
    template = templates.find((t) => t.name === templateName)
    if (!template) throw new Error(`Template "${templateName}" not found`)
  } else {
    template = pickRandomTemplate(templates)
  }
  console.log(`  Using template: ${template.name} (${template.slots.length} slots)`)

  console.log("  Crawling source website...")
  const crawlResult = await crawl(url)

  const provider = await createProvider()

  console.log("  Summarizing crawl data...")
  const businessData = await summarize(crawlResult, provider)

  console.log("  Copying template...")
  await copyTemplate(template, siteDir)

  await fillTemplate(siteDir, provider, template.slots, businessData)

  console.log("  Initializing git repo...")
  await init(siteDir)
  await commitAll(siteDir, "Initial site generated from template")

  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  await deploy(siteDir, "main", slug)

  console.log(`\n=== Done! Site "${slug}" is live ===\n`)
}

import { join } from "node:path"
import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { init, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { crawl } from "../scraper/crawler"
import { summarize } from "../scraper/summarizer"
import { discoverTemplates, pickRandomTemplate } from "../templates/registry"
import { copyTemplate } from "../templates/resolver"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import { GENERATE_SYSTEM_PROMPT, buildGenerateUserMessage } from "../llm/prompts"

function slugify(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/\./g, "-")
  } catch {
    throw new Error(`Invalid URL: "${url}"`)
  }
}

async function readAllSourceFiles(dir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue
        await walk(fullPath)
      } else if (
        entry.name.endsWith(".astro") ||
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".js") ||
        entry.name.endsWith(".mjs") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".json")
      ) {
        const relPath = fullPath.replace(dir, "").replace(/^\//, "")
        files[relPath] = await readFile(fullPath, "utf-8")
      }
    }
  }

  await walk(join(dir, "src"))
  return files
}

export async function generate(url: string, templateName?: string, customSlug?: string): Promise<void> {
  const slug = customSlug || slugify(url)
  const siteDir = join(process.cwd(), "sites", slug)

  if (existsSync(siteDir)) {
    throw new Error(`Site "${slug}" already exists at sites/${slug}`)
  }

  console.log(`\n=== Generate: ${url} -> ${slug} ===\n`)

  // 1. Scrape
  console.log("  Crawling source website...")
  const crawlResult = await crawl(url)

  const provider = await createProvider()

  console.log("  Summarizing crawl data...")
  const businessData = await summarize(crawlResult, provider)

  // 2. Template selection
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

  console.log(`  Using template: ${template.name}`)

  // 3. Copy template
  await copyTemplate(template.path, siteDir)

  // 4. Read source files
  console.log("  Reading site files...")
  const sourceFiles = await readAllSourceFiles(siteDir)

  // 5. LLM fills content
  console.log("  Filling content with business data...")
  const userMessage = buildGenerateUserMessage(sourceFiles, businessData)
  const llmResponse = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let fileMap: Record<string, string>
  try {
    let json = llmResponse
    const mdMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (mdMatch) json = mdMatch[1].trim()
    const jsonStart = json.indexOf("{")
    const jsonEnd = json.lastIndexOf("}") + 1
    fileMap = JSON.parse(json.slice(jsonStart, jsonEnd))
  } catch (err) {
    const preview = llmResponse.slice(0, 500)
    throw new Error(`LLM returned malformed response: ${(err as Error).message}\nPreview: ${preview}...`)
  }

  // 6. Write files
  console.log("  Writing modified files...")
  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await Bun.write(fullPath, content)
  }

  // 7. Install deps
  console.log("  Installing dependencies...")
  const { $ } = await import("bun")
  await $`bun install`.cwd(siteDir).quiet()

  // 8. Git init & commit
  console.log("  Initializing git repo...")
  await init(siteDir)
  await commitAll(siteDir, "Initial site generated from template")

  // 9. Build & deploy
  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  await deploy(siteDir, "main", slug)

  console.log(`\n=== Done! Site "${slug}" is live ===\n`)
}

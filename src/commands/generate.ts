import { join } from "node:path"
import { existsSync } from "node:fs"
import { init, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { crawl } from "../scraper/crawler"
import { summarize } from "../scraper/summarizer"
import { discoverTemplates, matchTemplate, pickRandomTemplate } from "../templates/registry"
import { scaffoldSite } from "../templates/resolver"
import { installBlocks } from "../templates/block-installer"
import { buildPage, readBlockFiles, writeBlockFiles, writeDataFiles } from "../templates/page-builder"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import {
  GENERATE_SYSTEM_PROMPT,
  buildGenerateUserMessage,
  CLASSIFY_BUSINESS_TYPE_PROMPT,
  buildClassifyBusinessTypeMessage,
} from "../llm/prompts"

function slugify(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/\./g, "-")
  } catch {
    throw new Error(`Invalid URL: "${url}"`)
  }
}

export async function generate(url: string, templateName?: string): Promise<void> {
  const slug = slugify(url)
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
    // Classify business type for auto-selection
    console.log("  Classifying business type...")
    const classifyResponse = await provider.generate(
      CLASSIFY_BUSINESS_TYPE_PROMPT,
      buildClassifyBusinessTypeMessage(
        businessData.business_name,
        businessData.description,
        businessData.sections.map((s) => s.type)
      )
    )
    const businessType = classifyResponse.trim().toLowerCase().replace(/[^a-z-]/g, "")
    console.log(`  Business type: ${businessType}`)

    const matches = matchTemplate(templates, businessType)
    template = pickRandomTemplate(matches.length > 0 ? matches : templates)
  }

  console.log(`  Using template: ${template.manifest.name} (${template.manifest.blocks.length} blocks)`)

  // 3. Scaffold site
  console.log("  Scaffolding site...")
  await scaffoldSite(siteDir)

  // 4. Install blocks from manifest
  await installBlocks(siteDir, template.manifest.blocks, template.manifest.source)

  // 5. Read installed block files for LLM
  console.log("  Reading installed block files...")
  const blockFiles = await readBlockFiles(siteDir)

  // 6. LLM fills content
  console.log("  Filling block content with business data...")
  const userMessage = buildGenerateUserMessage(
    template.manifest,
    blockFiles,
    businessData
  )
  const llmResponse = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let files: Record<string, string>
  let data: Record<string, unknown | null>
  try {
    const jsonStart = llmResponse.indexOf("{")
    const jsonEnd = llmResponse.lastIndexOf("}") + 1
    const parsed = JSON.parse(llmResponse.slice(jsonStart, jsonEnd))
    files = parsed.files || {}
    data = parsed.data || {}
  } catch {
    throw new Error("LLM returned malformed response — unable to parse { files, data }")
  }

  // 7. Write modified files and data
  console.log("  Writing transformed block files...")
  await writeBlockFiles(siteDir, files)

  console.log("  Writing content data files...")
  await writeDataFiles(siteDir, data)

  console.log("  Building page layout...")
  await buildPage(siteDir, template.manifest, data as Record<string, Record<string, unknown> | null>)

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

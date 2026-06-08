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

  const manifest = template.manifest
  const pageCount = manifest.pages.length
  const globalCount = manifest.global?.length || 0
  console.log(`  Using template: ${manifest.name} (${pageCount} pages, ${globalCount} global)`)

  // 3. Scaffold site
  console.log("  Scaffolding site...")
  await scaffoldSite(siteDir)

  // 4. Install global blocks
  if (manifest.global && manifest.global.length > 0) {
    console.log("  Installing global blocks...")
    await installBlocks(siteDir, manifest.global, manifest.source)
  }

  // 5. Install ALL page blocks upfront (so deps are resolved)
  const allPageBlocks = manifest.pages.flatMap((p) => p.blocks)
  const uniqueBlocks = allPageBlocks.filter(
    (b, i, arr) => arr.findIndex((x) => x.name === b.name) === i
  )
  console.log("  Installing page blocks...")
  await installBlocks(siteDir, uniqueBlocks, manifest.source)

  // 6. Read all installed files once
  console.log("  Reading installed block files...")
  const blockFiles = await readBlockFiles(siteDir)

  // 7. LLM fills content for ALL blocks at once
  console.log("  Filling block content with business data...")
  const allBlocks = [...(manifest.global || []), ...allPageBlocks]
  const userMessage = buildGenerateUserMessage(manifest, blockFiles, businessData)
  const llmResponse = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let files: Record<string, string>
  let data: Record<string, unknown | null>
  try {
    // Handle markdown-wrapped JSON (```json ... ```)
    let json = llmResponse
    const mdMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (mdMatch) {
      json = mdMatch[1].trim()
    }
    const jsonStart = json.indexOf("{")
    const jsonEnd = json.lastIndexOf("}") + 1
    const parsed = JSON.parse(json.slice(jsonStart, jsonEnd))
    files = parsed.files || {}
    data = parsed.data || {}
  } catch {
    throw new Error("LLM returned malformed response — unable to parse { files, data }")
  }

  // 8. Write modified files
  console.log("  Writing modified block files...")
  await writeBlockFiles(siteDir, files)

  console.log("  Writing content data files...")
  await writeDataFiles(siteDir, data)

  // 9. Build each page
  for (const page of manifest.pages) {
    const pageData: Record<string, unknown | null> = {}
    for (const block of page.blocks) {
      pageData[block.name] = data[block.name] !== undefined ? data[block.name] : null
    }
    console.log(`  Building page: ${page.route}`)
    await buildPage(siteDir, page, pageData, manifest)
  }

  // 10. Git init & commit
  console.log("  Initializing git repo...")
  await init(siteDir)
  await commitAll(siteDir, "Initial site generated from template")

  // 11. Build & deploy
  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  await deploy(siteDir, "main", slug)

  console.log(`\n=== Done! Site "${slug}" is live ===\n`)
}

import { join } from "node:path"
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import type { PageDefinition, TemplateManifest } from "../types"

function kebabToPascal(kebab: string): string {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

export async function readBlockFiles(siteDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const srcDir = join(siteDir, "src")

  try {
    await readdir(srcDir)
  } catch {
    return files
  }

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue
        await walk(fullPath)
      } else if (
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".astro") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".json")
      ) {
        const relPath = fullPath.replace(siteDir, "").replace(/^\//, "")
        files[relPath] = await readFile(fullPath, "utf-8")
      }
    }
  }

  await walk(srcDir)
  return files
}

export async function writeBlockFiles(
  siteDir: string,
  fileMap: Record<string, string>
): Promise<void> {
  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content)
  }
}

export async function writeDataFiles(
  siteDir: string,
  data: Record<string, unknown | null>
): Promise<void> {
  const dataDir = join(siteDir, "src", "data")
  await mkdir(dataDir, { recursive: true })

  let count = 0
  for (const [blockName, blockData] of Object.entries(data)) {
    if (blockData === null || blockData === undefined) continue
    await writeFile(
      join(dataDir, `${blockName}.json`),
      JSON.stringify(blockData, null, 2)
    )
    count++
  }

  console.log(`    Wrote ${count} data files.`)
}

export async function buildPage(
  siteDir: string,
  page: PageDefinition,
  content: Record<string, unknown | null>,
  manifest: TemplateManifest
): Promise<void> {
  // Combine global blocks + page blocks
  const globalBlocks = manifest.global || []
  const allBlocks = [...globalBlocks, ...page.blocks]
  
  const activeBlocks = allBlocks.filter(
    (block) => content[block.name] !== null
  )

  const imports = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `import ${componentName} from "@/components/ui/${block.name}"`
  })

  const components = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `    <${componentName} />`
  })

  const pageContent = `---
import Layout from "../layouts/Layout.astro"
${imports.join("\n")}
---

<Layout>
${components.join("\n")}
</Layout>
`

  // Determine file path from route
  const route = page.route === "/" ? "index" : page.route.replace(/^\//, "").replace(/\/$/, "")
  const pagesDir = join(siteDir, "src", "pages")
  await mkdir(pagesDir, { recursive: true })
  
  // Create subdirectory for non-root pages
  if (route !== "index") {
    const pageDir = join(pagesDir, route)
    await mkdir(pageDir, { recursive: true })
    await writeFile(join(pageDir, "index.astro"), pageContent)
  } else {
    await writeFile(join(pagesDir, "index.astro"), pageContent)
  }

  const activeCount = activeBlocks.length
  const totalCount = allBlocks.length
  console.log(`    ${page.route}: ${activeCount}/${totalCount} blocks (${globalBlocks.length} global + ${page.blocks.length} page)`)
}

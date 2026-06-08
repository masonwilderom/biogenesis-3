import { join } from "node:path"
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import type { TemplateManifest } from "../types"

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

export async function buildPage(
  siteDir: string,
  manifest: TemplateManifest,
  content: Record<string, unknown | null>
): Promise<void> {
  const activeBlocks = manifest.blocks.filter(
    (block) => content[block.name] !== null
  )

  const imports = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `import ${componentName} from "@/components/${block.name}"`
  })

  const components = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `    <${componentName} />`
  })

  const page = `---
import Layout from "../layouts/Layout.astro"
${imports.join("\n")}
---

<Layout>
${components.join("\n")}
</Layout>
`

  const pagesDir = join(siteDir, "src", "pages")
  await mkdir(pagesDir, { recursive: true })
  await writeFile(join(pagesDir, "index.astro"), page)

  console.log(`  Page built with ${activeBlocks.length}/${manifest.blocks.length} blocks.`)
}

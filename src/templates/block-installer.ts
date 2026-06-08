import { join } from "node:path"
import { mkdir, readFile } from "node:fs/promises"
import type { BlockManifestEntry } from "../types"

export async function installBlock(
  siteDir: string,
  blockName: string,
  source: string
): Promise<void> {
  console.log(`    Installing block: ${blockName}`)

  const blockDir = join(process.cwd(), "templates/blocks", source, blockName)
  const registryPath = join(blockDir, "registry.json")
  
  let registry: any
  try {
    registry = JSON.parse(await readFile(registryPath, "utf-8"))
  } catch {
    throw new Error(`Block "${blockName}" not found in ${source} registry`)
  }

  if (registry.files) {
    for (const file of registry.files) {
      if (file.target && file.content) {
        const destPath = join(siteDir, "src", file.target)
        await mkdir(join(destPath, ".."), { recursive: true })
        await Bun.write(destPath, file.content)
      }
    }
  }

  console.log(`      Installed to src/${registry.files?.[0]?.target || "components/"}`)
}

export async function installBlocks(
  siteDir: string,
  blocks: BlockManifestEntry[],
  source: string
): Promise<void> {
  console.log(`  Installing ${blocks.length} blocks from ${source}...`)

  for (const block of blocks) {
    await installBlock(siteDir, block.name, source)
  }

  console.log(`  ${blocks.length} blocks installed.`)
}

import { join } from "node:path"
import { cp, readdir, mkdir } from "node:fs/promises"
import type { BlockManifestEntry } from "../types"

export async function installBlock(
  siteDir: string,
  blockName: string,
  source: string
): Promise<void> {
  console.log(`    Installing block: ${blockName}`)

  const blockDir = join(process.cwd(), "templates/blocks", source, blockName)
  const destDir = join(siteDir, "src/components/ui")

  async function copyFiles(src: string, dest: string) {
    await mkdir(dest, { recursive: true })
    const entries = await readdir(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)
      if (entry.isDirectory()) {
        await copyFiles(srcPath, destPath)
      } else if (entry.name !== "meta.json") {
        await cp(srcPath, destPath)
      }
    }
  }

  await copyFiles(join(blockDir, "src", "components", "ui"), destDir)
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

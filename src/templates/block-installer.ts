import { $ } from "bun"
import type { BlockManifestEntry } from "../types"

export async function installBlock(
  siteDir: string,
  blockName: string
): Promise<void> {
  console.log(`    Installing block: ${blockName}`)

  const result = await $`npx shadcn@latest add ${blockName} --yes --overwrite`.cwd(siteDir).nothrow()

  if (result.exitCode !== 0) {
    console.warn(`    [warn] Could not install block "${blockName}":\n${result.stderr.toString()}`)
    throw new Error(`Failed to install block "${blockName}"`)
  }
}

export async function installBlocks(
  siteDir: string,
  blocks: BlockManifestEntry[]
): Promise<void> {
  console.log("  Installing shadcn blocks...")

  for (const block of blocks) {
    await installBlock(siteDir, block.name)
  }

  console.log(`  ${blocks.length} blocks installed.`)
}

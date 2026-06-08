import { $ } from "bun"
import type { BlockManifestEntry } from "../types"

export async function installBlock(
  siteDir: string,
  blockName: string,
  source: string
): Promise<boolean> {
  const fullName = `${source}/${blockName}`
  console.log(`    Installing block: ${fullName}`)

  const result = await $`npx shadcn@latest add ${fullName} --yes`.cwd(siteDir).nothrow()

  if (result.exitCode !== 0) {
    const err = result.stderr.toString()
    console.warn(`    [warn] Could not install "${fullName}" — skipping`)
    return false
  }
  return true
}

export async function installBlocks(
  siteDir: string,
  blocks: BlockManifestEntry[],
  source: string
): Promise<void> {
  console.log(`  Installing ${blocks.length} blocks from ${source}...`)

  // Register the registry source first
  const regResult = await $`npx shadcn@latest registry add ${source}`.cwd(siteDir).nothrow()
  if (regResult.exitCode !== 0) {
    console.warn(`    [warn] Could not register ${source} (may already be registered)`)
  }

  let installed = 0
  for (const block of blocks) {
    const ok = await installBlock(siteDir, block.name, source)
    if (ok) installed++
  }

  console.log(`  ${installed}/${blocks.length} blocks installed.`)
}

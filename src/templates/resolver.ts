import { $ } from "bun"
import { existsSync } from "node:fs"

export async function scaffoldSite(siteDir: string): Promise<void> {
  if (existsSync(siteDir)) {
    throw new Error(`Site directory already exists: ${siteDir}`)
  }

  console.log("  Scaffolding Astro project...")

  // Step 1: Create Astro project (pipe 'yes' to accept defaults)
  const create = await $`echo 'yes' | bun create astro@latest ${siteDir} -- --template minimal --skip-houston --no-git`.nothrow()
  if (create.exitCode !== 0) {
    throw new Error(`Failed to create Astro project:\n${create.stderr.toString()}`)
  }

  // Step 2: Add React integration
  const reactAdd = await $`bunx --bun astro add react --yes`.cwd(siteDir).nothrow()
  if (reactAdd.exitCode !== 0) {
    throw new Error(`Failed to add React:\n${reactAdd.stderr.toString()}`)
  }

  // Step 3: Add Tailwind integration
  const tailwindAdd = await $`bunx --bun astro add tailwind --yes`.cwd(siteDir).nothrow()
  if (tailwindAdd.exitCode !== 0) {
    throw new Error(`Failed to add Tailwind:\n${tailwindAdd.stderr.toString()}`)
  }

  // Step 4: Initialize shadcn
  const shadcnInit = await $`npx shadcn@latest init --defaults --yes`.cwd(siteDir).nothrow()
  if (shadcnInit.exitCode !== 0) {
    throw new Error(`Failed to init shadcn:\n${shadcnInit.stderr.toString()}`)
  }

  console.log("  Scaffold complete.")
}

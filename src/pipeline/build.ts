import { $ } from "bun"

export async function build(dir: string): Promise<void> {
  console.log(`  Building site at ${dir}...`)

  const install = await $`bun install`.cwd(dir).nothrow().quiet()
  if (install.exitCode !== 0) {
    throw new Error(`bun install failed in ${dir}:\n${install.stderr.toString()}`)
  }

  const result = await $`bun run build`.cwd(dir).nothrow()
  if (result.exitCode !== 0) {
    throw new Error(`Build failed in ${dir}:\n${result.stderr.toString()}`)
  }

  console.log(`  Build complete.`)
}

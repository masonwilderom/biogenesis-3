import { $ } from "bun"
import { existsSync } from "node:fs"
import { join } from "node:path"

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

  // Step 4: Configure path aliases for shadcn (required before shadcn init)
  const tsconfigPath = join(siteDir, "tsconfig.json")
  const pkgPath = join(siteDir, "package.json")
  try {
    const tsconfig = JSON.parse(await Bun.file(tsconfigPath).text())
    tsconfig.compilerOptions = tsconfig.compilerOptions || {}
    tsconfig.compilerOptions.paths = { "@/*": ["./src/*"] }
    tsconfig.compilerOptions.baseUrl = "."
    await Bun.write(tsconfigPath, JSON.stringify(tsconfig, null, 2))
    
    const pkg = JSON.parse(await Bun.file(pkgPath).text())
    pkg.imports = pkg.imports || {}
    pkg.imports["@/*"] = "./src/*"
    await Bun.write(pkgPath, JSON.stringify(pkg, null, 2))
  } catch (err) {
    throw new Error(`Failed to configure import aliases:\n${(err as Error).message}`)
  }

  // Step 5: Initialize shadcn
  const shadcnInit = await $`npx shadcn@latest init --defaults --yes`.cwd(siteDir).nothrow()
  if (shadcnInit.exitCode !== 0) {
    throw new Error(`Failed to init shadcn:\n${shadcnInit.stderr.toString()}`)
  }

  // Step 6: Add @/ path alias to Astro/Vite config
  try {
    const configPath = join(siteDir, "astro.config.mjs")
    let config = await Bun.file(configPath).text()
    if (!config.includes("resolve:")) {
      const aliasBlock = `
import path from "path"
import { fileURLToPath } from "url"
const __dirname = path.dirname(fileURLToPath(import.meta.url))`
      // Insert after the last import
      const lastImportIdx = config.lastIndexOf("import ")
      const afterLastImport = config.indexOf("\n", config.indexOf("\n", lastImportIdx)) + 1
      config = config.slice(0, afterLastImport) + aliasBlock + "\n" + config.slice(afterLastImport)
      config = config.replace(
        "plugins: [tailwindcss()]",
        `plugins: [tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } }`
      )
      await Bun.write(configPath, config)
    }
  } catch (err) {
    console.warn(`    [warn] Could not add alias to astro config: ${(err as Error).message}`)
  }

  console.log("  Scaffold complete.")
}

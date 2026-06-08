import { mkdir, cp, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"

export async function copyTemplate(srcDir: string, destDir: string): Promise<void> {
  if (existsSync(destDir)) {
    throw new Error(`Site directory already exists: ${destDir}`)
  }

  console.log("  Copying template...")

  async function copy(src: string, dest: string) {
    await mkdir(dest, { recursive: true })
    const entries = await readdir(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue
        await copy(srcPath, destPath)
      } else {
        await cp(srcPath, destPath)
      }
    }
  }

  await copy(srcDir, destDir)
  console.log("  Template copied.")
}

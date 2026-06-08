import { copyFile, mkdir, readdir } from "node:fs/promises"
import { join } from "node:path"
import { existsSync } from "node:fs"
import type { Template } from "../types"

export async function copyTemplate(
  template: Template,
  destDir: string
): Promise<void> {
  if (existsSync(destDir)) {
    const entries = await readdir(destDir)
    if (entries.length > 0) {
      throw new Error(`Destination "${destDir}" already exists and is not empty`)
    }
  }

  await copyDir(template.path, destDir)
}

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true })

  const entries = await readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue
      await copyDir(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

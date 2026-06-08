import { readdir, stat } from "node:fs/promises"
import { join } from "node:path"
import type { Template } from "../types"

export async function discoverTemplates(
  templatesRoot: string
): Promise<Template[]> {
  const templates: Template[] = []

  try {
    const entries = await readdir(templatesRoot, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const templateDir = join(templatesRoot, entry.name)
      const pkgPath = join(templateDir, "package.json")

      try {
        const pkgStat = await stat(pkgPath)
        if (pkgStat.isFile()) {
          templates.push({
            name: entry.name,
            path: templateDir,
          })
        }
      } catch {
        continue
      }
    }
  } catch {
    return []
  }

  return templates
}

export function pickRandomTemplate(templates: Template[]): Template {
  if (templates.length === 0) {
    throw new Error("No templates available")
  }
  return templates[Math.floor(Math.random() * templates.length)]
}

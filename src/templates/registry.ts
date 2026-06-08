import { readdir } from "node:fs/promises"
import { join } from "node:path"
import type { Template, TemplateManifest } from "../types"

export async function discoverTemplates(
  templatesRoot: string
): Promise<Template[]> {
  const templates: Template[] = []

  try {
    const entries = await readdir(templatesRoot, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const templateDir = join(templatesRoot, entry.name)
      const manifestPath = join(templateDir, "manifest.json")

      try {
        const manifestContent = await Bun.file(manifestPath).text()
        const manifest = JSON.parse(manifestContent) as TemplateManifest

        templates.push({
          name: entry.name,
          path: templateDir,
          manifest,
        })
      } catch {
        continue
      }
    }
  } catch {
    return []
  }

  return templates
}

export function matchTemplate(
  templates: Template[],
  businessType: string
): Template[] {
  const directMatches = templates.filter((t) =>
    t.manifest.types.includes(businessType)
  )

  if (directMatches.length > 0) return directMatches

  const wildcardMatches = templates.filter((t) =>
    t.manifest.types.includes("*")
  )

  return wildcardMatches
}

export function pickRandomTemplate(templates: Template[]): Template {
  if (templates.length === 0) {
    throw new Error("No templates available")
  }
  return templates[Math.floor(Math.random() * templates.length)]
}

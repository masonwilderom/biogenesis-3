import { readdir, stat } from "node:fs/promises"
import { join } from "node:path"
import type { Template, TemplateSlot } from "../types"

const SLOT_REGEX = /\{\{SLOT:(\w+)\}\}/g

async function extractSlots(templateDir: string): Promise<TemplateSlot[]> {
  const slots = new Map<string, string>()
  const astroFiles = await collectAstroFiles(templateDir)

  for (const file of astroFiles) {
    const content = await Bun.file(file).text()
    let match: RegExpExecArray | null
    while ((match = SLOT_REGEX.exec(content)) !== null) {
      const name = match[1]
      if (!slots.has(name)) {
        slots.set(name, `{{SLOT:${name}}}`)
      }
    }
  }

  return Array.from(slots.entries()).map(([name, marker]) => ({ name, marker }))
}

async function collectAstroFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await collectAstroFiles(fullPath)
      results.push(...subFiles)
    } else if (entry.name.endsWith(".astro")) {
      results.push(fullPath)
    }
  }

  return results
}

export async function discoverTemplates(
  templatesRoot: string
): Promise<Template[]> {
  const templates: Template[] = []

  try {
    const entries = await readdir(templatesRoot, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name === "blocks") continue

      const templateDir = join(templatesRoot, entry.name)
      const pkgPath = join(templateDir, "package.json")

      try {
        const pkgStat = await stat(pkgPath)
        if (!pkgStat.isFile()) continue
      } catch {
        continue
      }

      const slots = await extractSlots(templateDir)

      templates.push({
        name: entry.name,
        path: templateDir,
        slots,
      })
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

import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { discoverTemplates } from "./registry"

const TEMP_TEMPLATES = join(import.meta.dirname, "../../test-tmp-templates")

beforeAll(() => {
  rmSync(TEMP_TEMPLATES, { recursive: true, force: true })
  mkdirSync(join(TEMP_TEMPLATES, "alpha"), { recursive: true })
  mkdirSync(join(TEMP_TEMPLATES, "beta"), { recursive: true })
  mkdirSync(join(TEMP_TEMPLATES, "gamma", "src", "pages"), { recursive: true })
  writeFileSync(join(TEMP_TEMPLATES, "alpha", "package.json"), "{}")
  writeFileSync(join(TEMP_TEMPLATES, "beta", "package.json"), "{}")
  writeFileSync(join(TEMP_TEMPLATES, "gamma", "package.json"), "{}")
  writeFileSync(join(TEMP_TEMPLATES, "gamma", "src", "pages", "index.astro"), "{{SLOT:hero}}")
})

afterAll(() => {
  if (existsSync(TEMP_TEMPLATES)) {
    rmSync(TEMP_TEMPLATES, { recursive: true, force: true })
  }
})

describe("template registry", () => {
  it("discovers all template directories with package.json", async () => {
    const templates = await discoverTemplates(TEMP_TEMPLATES)
    const names = templates.map((t) => t.name).sort()
    expect(names).toEqual(["alpha", "beta", "gamma"])
  })

  it("returns empty array for empty directory", async () => {
    const templates = await discoverTemplates(join(TEMP_TEMPLATES, "alpha"))
    expect(templates).toEqual([])
  })

  it("each template has name, path, and slots", async () => {
    const templates = await discoverTemplates(TEMP_TEMPLATES)
    for (const t of templates) {
      expect(t.name).toBeString()
      expect(t.path).toBeString()
      expect(Array.isArray(t.slots)).toBe(true)
    }
  })
})

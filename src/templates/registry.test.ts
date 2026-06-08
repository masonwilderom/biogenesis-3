import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { discoverTemplates, matchTemplate, pickRandomTemplate } from "./registry"
import type { TemplateManifest } from "../types"

const TEMP_DIR = join(import.meta.dirname, "../../test-tmp-manifests")

const restaurantManifest: TemplateManifest = {
  name: "restaurant-one",
  description: "Restaurants and food businesses",
  types: ["restaurant", "cafe", "bakery"],
  blocks: [
    { name: "hero-01", optional: false, fields: { heading: { type: "string" } } },
    { name: "footer-01", optional: false, fields: { business_name: { type: "string" } } },
  ],
}

const genericManifest: TemplateManifest = {
  name: "generic-one",
  description: "Generic fallback",
  types: ["*"],
  blocks: [
    { name: "hero-01", optional: false, fields: { heading: { type: "string" } } },
  ],
}

beforeAll(() => {
  rmSync(TEMP_DIR, { recursive: true, force: true })
  mkdirSync(join(TEMP_DIR, "restaurant-one"), { recursive: true })
  mkdirSync(join(TEMP_DIR, "generic-one"), { recursive: true })
  writeFileSync(
    join(TEMP_DIR, "restaurant-one", "manifest.json"),
    JSON.stringify(restaurantManifest, null, 2)
  )
  writeFileSync(
    join(TEMP_DIR, "generic-one", "manifest.json"),
    JSON.stringify(genericManifest, null, 2)
  )
  // Directory without manifest — should be skipped
  mkdirSync(join(TEMP_DIR, "empty-dir"), { recursive: true })
})

afterAll(() => {
  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true })
})

describe("template registry v2", () => {
  it("discovers all template directories with manifest.json", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const names = templates.map((t) => t.name).sort()
    expect(names).toEqual(["generic-one", "restaurant-one"])
  })

  it("skips directories without manifest.json", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const names = templates.map((t) => t.name)
    expect(names).not.toContain("empty-dir")
  })

  it("each template has manifest with blocks", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    for (const t of templates) {
      expect(t.manifest).toBeDefined()
      expect(t.manifest.blocks.length).toBeGreaterThan(0)
    }
  })

  it("matchTemplate returns matching templates for a business type", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const matches = matchTemplate(templates, "bakery")
    expect(matches.length).toBe(1)
    expect(matches[0].manifest.name).toBe("restaurant-one")
  })

  it("matchTemplate returns wildcard templates as fallback", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const matches = matchTemplate(templates, "law-firm")
    expect(matches.length).toBe(1)
    expect(matches[0].manifest.name).toBe("generic-one")
  })

  it("matchTemplate returns all matches including wildcard", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const matches = matchTemplate(templates, "restaurant")
    expect(matches.length).toBeGreaterThanOrEqual(1)
    expect(matches.some((t) => t.manifest.name === "restaurant-one")).toBe(true)
  })

  it("pickRandomTemplate picks from array", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const picked = pickRandomTemplate(templates)
    expect(templates).toContain(picked)
  })

  it("pickRandomTemplate throws on empty array", () => {
    expect(() => pickRandomTemplate([])).toThrow("No templates available")
  })
})

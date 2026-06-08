import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { discoverTemplates, pickRandomTemplate } from "./registry"

const TEMP_DIR = join(import.meta.dirname, "../../test-tmp-templates")

beforeAll(() => {
  rmSync(TEMP_DIR, { recursive: true, force: true })
  mkdirSync(join(TEMP_DIR, "alpha"), { recursive: true })
  mkdirSync(join(TEMP_DIR, "beta"), { recursive: true })
  mkdirSync(join(TEMP_DIR, "empty-dir"), { recursive: true })
  writeFileSync(join(TEMP_DIR, "alpha", "package.json"), "{}")
  writeFileSync(join(TEMP_DIR, "beta", "package.json"), "{}")
})

afterAll(() => {
  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true })
})

describe("template registry", () => {
  it("discovers template directories with package.json", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const names = templates.map((t) => t.name).sort()
    expect(names).toEqual(["alpha", "beta"])
  })

  it("skips directories without package.json", async () => {
    const templates = await discoverTemplates(TEMP_DIR)
    const names = templates.map((t) => t.name)
    expect(names).not.toContain("empty-dir")
  })

  it("pickRandomTemplate picks a template", () => {
    const templates = [{ name: "a", path: "/a" }, { name: "b", path: "/b" }]
    const picked = pickRandomTemplate(templates)
    expect(templates).toContain(picked)
  })

  it("pickRandomTemplate throws on empty array", () => {
    expect(() => pickRandomTemplate([])).toThrow("No templates available")
  })
})

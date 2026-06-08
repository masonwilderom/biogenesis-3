// src/templates/resolver.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { copyTemplate } from "./resolver"
import type { Template } from "../types"

const TEMP_SRC = join(import.meta.dirname, "../../test-tmp-resolver-src")
const TEMP_DST = join(import.meta.dirname, "../../test-tmp-resolver-dst")

const testTemplate: Template = {
  name: "test-template",
  path: TEMP_SRC,
  slots: [
    { name: "hero", marker: "{{SLOT:hero}}" },
    { name: "features", marker: "{{SLOT:features}}" },
  ],
}

beforeAll(() => {
  rmSync(TEMP_SRC, { recursive: true, force: true })
  rmSync(TEMP_DST, { recursive: true, force: true })
  mkdirSync(join(TEMP_SRC, "src", "pages"), { recursive: true })
  writeFileSync(join(TEMP_SRC, "package.json"), '{"name":"test"}')
  writeFileSync(
    join(TEMP_SRC, "src", "pages", "index.astro"),
    "<html>{{SLOT:hero}}{{SLOT:features}}</html>"
  )
  writeFileSync(join(TEMP_SRC, ".gitignore"), "node_modules")
})

beforeEach(() => {
  rmSync(TEMP_DST, { recursive: true, force: true })
})

afterAll(() => {
  if (existsSync(TEMP_SRC)) rmSync(TEMP_SRC, { recursive: true, force: true })
  if (existsSync(TEMP_DST)) rmSync(TEMP_DST, { recursive: true, force: true })
})

describe("template resolver", () => {
  it("copies template to destination directory", async () => {
    mkdirSync(TEMP_DST, { recursive: true })
    await copyTemplate(testTemplate, TEMP_DST)
    expect(existsSync(join(TEMP_DST, "package.json"))).toBe(true)
    expect(existsSync(join(TEMP_DST, "src", "pages", "index.astro"))).toBe(true)
    expect(existsSync(join(TEMP_DST, ".gitignore"))).toBe(true)
  })

  it("copied files retain slot markers", async () => {
    mkdirSync(TEMP_DST, { recursive: true })
    await copyTemplate(testTemplate, TEMP_DST)
    const content = await Bun.file(
      join(TEMP_DST, "src", "pages", "index.astro")
    ).text()
    expect(content).toContain("{{SLOT:hero}}")
    expect(content).toContain("{{SLOT:features}}")
  })

  it("throws if destination already exists", async () => {
    mkdirSync(TEMP_DST, { recursive: true })
    writeFileSync(join(TEMP_DST, "existing.txt"), "x")
    await expect(copyTemplate(testTemplate, TEMP_DST)).rejects.toThrow(
      "already exists"
    )
  })
})

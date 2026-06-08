// src/templates/page-builder.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { buildPage, readBlockFiles } from "./page-builder"
import type { TemplateManifest, PageDefinition } from "../types"

const TEMP_SITE = join(import.meta.dirname, "../../test-tmp-page-builder")

const manifest: TemplateManifest = {
  name: "test-template",
  description: "test",
  source: "bundui",
  types: ["*"],
  global: [
    { name: "navbars-01", optional: false, fields: { logo_text: { type: "string" } } },
    { name: "footers", optional: false, fields: { business_name: { type: "string" } } },
  ],
  pages: [
    {
      route: "/",
      title: "Home",
      blocks: [
        { name: "hero-sections-01", optional: false, fields: { heading: { type: "string" } } },
        { name: "testimonials-01", optional: true, fields: { heading: { type: "string" } } },
      ]
    }
  ]
}

const filledFiles: Record<string, string> = {
  "src/components/ui/navbars-01.tsx": 'export default function Navbars01() { return <nav>Firm</nav> }',
  "src/components/ui/footers.tsx": 'export default function Footers() { return <footer>2025</footer> }',
  "src/components/ui/hero-sections-01.tsx": 'export default function HeroSections01() { return <h1>Hero</h1> }',
  "src/components/ui/testimonials-01.tsx": 'export default function Testimonials01() { return <div>Reviews</div> }',
}

beforeAll(() => {
  rmSync(TEMP_SITE, { recursive: true, force: true })
  mkdirSync(join(TEMP_SITE, "src", "pages"), { recursive: true })
  mkdirSync(join(TEMP_SITE, "src", "components", "ui"), { recursive: true })
  for (const [path, content] of Object.entries(filledFiles)) {
    mkdirSync(join(TEMP_SITE, path, ".."), { recursive: true })
    writeFileSync(join(TEMP_SITE, path), content)
  }
})

afterAll(() => {
  if (existsSync(TEMP_SITE)) rmSync(TEMP_SITE, { recursive: true, force: true })
})

describe("page builder v2", () => {
  it("builds page with global + page blocks", async () => {
    const content: Record<string, unknown | null> = {
      "navbars-01": { logo_text: "Firm" },
      "footers": { business_name: "Firm" },
      "hero-sections-01": { heading: "Hero" },
      "testimonials-01": { heading: "Reviews" },
    }

    const page = manifest.pages[0]
    await buildPage(TEMP_SITE, page, content, manifest)
    const pageContent = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    expect(pageContent).toContain("navbars-01")
    expect(pageContent).toContain("footers")
    expect(pageContent).toContain("hero-sections-01")
    expect(pageContent).toContain("testimonials-01")
  })

  it("skips optional blocks with null content", async () => {
    const content: Record<string, unknown | null> = {
      "navbars-01": { logo_text: "Firm" },
      "footers": { business_name: "Firm" },
      "hero-sections-01": { heading: "Hero" },
      "testimonials-01": null,
    }

    const page = manifest.pages[0]
    await buildPage(TEMP_SITE, page, content, manifest)
    const pageContent = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    expect(pageContent).toContain("navbars-01")
    expect(pageContent).toContain("hero-sections-01")
    expect(pageContent).not.toContain("testimonials-01")
  })

  it("global blocks come before page blocks", async () => {
    const content: Record<string, unknown | null> = {
      "navbars-01": { logo_text: "Firm" },
      "footers": { business_name: "Firm" },
      "hero-sections-01": { heading: "Hero" },
      "testimonials-01": null,
    }

    const page = manifest.pages[0]
    await buildPage(TEMP_SITE, page, content, manifest)
    const pageContent = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    const navIdx = pageContent.indexOf("navbars-01")
    const footerIdx = pageContent.indexOf("footers")
    const heroIdx = pageContent.indexOf("hero-sections-01")
    expect(navIdx).toBeLessThan(footerIdx)
    expect(footerIdx).toBeLessThan(heroIdx)
  })
})

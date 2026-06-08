import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { buildPage, readBlockFiles } from "./page-builder"
import type { TemplateManifest } from "../types"

const TEMP_SITE = join(import.meta.dirname, "../../test-tmp-page-builder")

const manifest: TemplateManifest = {
  name: "test-template",
  description: "test",
  types: ["*"],
  blocks: [
    { name: "hero-01", registry_url: "https://21st.dev/r/test/hero-01", optional: false, fields: { heading: { type: "string" } } },
    { name: "testimonial-01", registry_url: "https://21st.dev/r/test/testimonial-01", optional: true, fields: { heading: { type: "string" } } },
    { name: "footer-01", registry_url: "https://21st.dev/r/test/footer-01", optional: false, fields: { business_name: { type: "string" } } },
  ],
}

  const filledFiles: Record<string, string> = {
  "src/components/ui/hero-01.tsx": 'export default function Hero01() { return <h1>Fresh Bread</h1> }',
  "src/components/ui/testimonial-01.tsx": 'export default function Testimonial01() { return <div>Testimonials</div> }',
  "src/components/ui/footer-01.tsx": 'export default function Footer01() { return <footer>Lucas Bakery</footer> }',
}

beforeAll(() => {
  rmSync(TEMP_SITE, { recursive: true, force: true })
  mkdirSync(join(TEMP_SITE, "src", "pages"), { recursive: true })
  mkdirSync(join(TEMP_SITE, "src", "components"), { recursive: true })
  mkdirSync(join(TEMP_SITE, "src", "layouts"), { recursive: true })
  writeFileSync(join(TEMP_SITE, "src", "layouts", "Layout.astro"), "---\nconst { title } = Astro.props\n---\n<html><body><slot /></body></html>")
  for (const [path, content] of Object.entries(filledFiles)) {
    mkdirSync(join(TEMP_SITE, path, ".."), { recursive: true })
    writeFileSync(join(TEMP_SITE, path), content)
  }
})

afterAll(() => {
  if (existsSync(TEMP_SITE)) rmSync(TEMP_SITE, { recursive: true, force: true })
})

describe("page builder", () => {
  it("builds index.astro with all non-null blocks", async () => {
    const content: Record<string, unknown | null> = {
      "hero-01": { heading: "Fresh Bread" },
      "testimonial-01": { heading: "What Customers Say" },
      "footer-01": { business_name: "Lucas Bakery" },
    }

    await buildPage(TEMP_SITE, manifest, content)
    const page = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    expect(page).toContain("@/components/ui/hero-01")
    expect(page).toContain("@/components/ui/testimonial-01")
    expect(page).toContain("@/components/ui/footer-01")
  })

  it("skips optional blocks with null content", async () => {
    const content: Record<string, unknown | null> = {
      "hero-01": { heading: "Fresh Bread" },
      "testimonial-01": null,
      "footer-01": { business_name: "Lucas Bakery" },
    }

    await buildPage(TEMP_SITE, manifest, content)
    const page = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    expect(page).toContain("hero-01")
    expect(page).not.toContain("testimonial-01")
    expect(page).toContain("footer-01")
  })

  it("enforces manifest order in page", async () => {
    const content: Record<string, unknown | null> = {
      "hero-01": { heading: "A" },
      "testimonial-01": { heading: "B" },
      "footer-01": { business_name: "C" },
    }

    await buildPage(TEMP_SITE, manifest, content)
    const page = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    const heroIdx = page.indexOf("hero-01")
    const testIdx = page.indexOf("testimonial-01")
    const footerIdx = page.indexOf("footer-01")
    expect(heroIdx).toBeLessThan(testIdx)
    expect(testIdx).toBeLessThan(footerIdx)
  })
})

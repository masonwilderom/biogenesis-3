# v2 Template System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hand-written template Astro projects with manifest-driven shadcn block composition. Templates are `manifest.json` files. The generate command scaffolds a fresh Astro+React+Tailwind+shadcn project per site and instructs the LLM to fill block content based on scraped business data.

**Architecture:** `templates/registry.ts` discovers manifests and matches business types. `templates/resolver.ts` scaffolds the Astro project via CLI. `templates/block-installer.ts` runs `shadcn add`. `templates/page-builder.ts` generates the page that composes blocks. The LLM receives installed block source files + manifest schema + business data and outputs modified files with content filled. The generate command now scrapes first, then selects template, then scaffolds.

**Tech Stack:** Same as v1 — Bun, TypeScript, Commander, Cheerio, DeepSeek API, Wrangler, Astro, shadcn/ui (React).

---

### Task 1: Cleanup Old Template Files

**Files:**
- Delete: `templates/business-one/src/` (recursive)
- Delete: `templates/business-one/astro.config.mjs`
- Delete: `templates/business-one/package.json`
- Delete: `templates/business-one/bun.lock`
- Delete: `templates/business-one/public/`
- Delete: `templates/business-one/node_modules/` (recursive)
- Delete: `templates/blocks/` (recursive)
- Delete: `templates/business-one/src/components/ui/` (if it exists)

- [ ] **Step 1: Remove old files**

```bash
rm -rf templates/business-one/src
rm -f templates/business-one/astro.config.mjs
rm -f templates/business-one/package.json
rm -f templates/business-one/bun.lock
rm -rf templates/business-one/public
rm -rf templates/business-one/node_modules
rm -rf templates/blocks
```

- [ ] **Step 2: Verify only manifest.json remains in templates/business-one/**

```bash
ls templates/business-one/
```

Expected: empty directory (or nothing).

- [ ] **Step 3: Commit**

```bash
git add -A templates/
git commit -m "chore: remove old hand-written template files"
```

---

### Task 2: Update Shared Types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Read current src/types.ts, then replace with updated version**

```ts
export interface CrawlPage {
  url: string
  title: string
  headings: { level: number; text: string }[]
  paragraphs: string[]
  links: string[]
  images: string[]
}

export interface CrawlResult {
  pages: CrawlPage[]
}

export interface StructuredSection {
  type: string
  heading: string
  body: string
  image_url?: string
  items?: { title: string; description: string }[]
}

export interface StructuredData {
  business_name: string
  tagline: string
  description: string
  sections: StructuredSection[]
  contact: {
    email?: string
    phone?: string
    address?: string
  }
  color_hints: string[]
  social_links: { platform: string; url: string }[]
}

export interface BlockFieldSchema {
  type: "string" | "array"
  hint?: string
  items?: Record<string, string>
}

export interface BlockManifestEntry {
  name: string
  optional: boolean
  fields: Record<string, BlockFieldSchema>
}

export interface TemplateManifest {
  name: string
  description: string
  types: string[]
  blocks: BlockManifestEntry[]
}

export interface ContentPayload {
  [blockName: string]: Record<string, unknown> | null
}

export interface Template {
  name: string
  path: string
  manifest: TemplateManifest
}

export const STAGING_BRANCH = "staging"
export const MAIN_BRANCH = "main"
```

- [ ] **Step 2: Verify typecheck passes (old template types removed)**

Run: `bun run typecheck`
Expected: no errors (old types like TemplateSlot were only used by old registry/resolver; those will be rewritten).

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add manifest and content payload types"
```

---

### Task 3: Rewrite Template Registry

**Files:**
- Modify: `src/templates/registry.ts` (full rewrite)
- Modify: `src/templates/registry.test.ts` (full rewrite)

- [ ] **Step 1: Write failing tests**

```ts
// src/templates/registry.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/templates/registry.test.ts`
Expected: all tests fail (old registry won't find manifests).

- [ ] **Step 3: Rewrite src/templates/registry.ts**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/templates/registry.test.ts`
Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/templates/registry.ts src/templates/registry.test.ts
git commit -m "feat: rewrite template registry for manifest-based discovery"
```

---

### Task 4: Rewrite Template Resolver

**Files:**
- Modify: `src/templates/resolver.ts` (full rewrite)
- Delete (old test): `src/templates/resolver.test.ts`
- New test: `src/templates/resolver.test.ts`

The resolver no longer copies files — it scaffolds a fresh Astro project via CLI commands.

- [ ] **Step 1: Delete old test file and commit separately**

```bash
rm src/templates/resolver.test.ts
git add src/templates/resolver.test.ts
git commit -m "test: remove old copy-based resolver tests"
```

- [ ] **Step 2: Rewrite src/templates/resolver.ts**

```ts
import { $ } from "bun"
import { existsSync } from "node:fs"
import { join } from "node:path"

export async function scaffoldSite(siteDir: string): Promise<void> {
  if (existsSync(siteDir)) {
    throw new Error(`Site directory already exists: ${siteDir}`)
  }

  console.log("  Scaffolding Astro project...")

  // Step 1: Create Astro project (skip interactive prompts)
  const create = await $`bun create astro@latest ${siteDir} -- --template minimal --skip-houston --no-install`.nothrow()
  if (create.exitCode !== 0) {
    throw new Error(`Failed to create Astro project:\n${create.stderr.toString()}`)
  }

  // Step 2: Add React integration
  const reactAdd = await $`bun astro add react --yes`.cwd(siteDir).nothrow()
  if (reactAdd.exitCode !== 0) {
    throw new Error(`Failed to add React:\n${reactAdd.stderr.toString()}`)
  }

  // Step 3: Add Tailwind integration
  const tailwindAdd = await $`bun astro add tailwind --yes`.cwd(siteDir).nothrow()
  if (tailwindAdd.exitCode !== 0) {
    throw new Error(`Failed to add Tailwind:\n${tailwindAdd.stderr.toString()}`)
  }

  // Step 4: Initialize shadcn
  const shadcnInit = await $`npx shadcn@latest init --defaults --yes`.cwd(siteDir).nothrow()
  if (shadcnInit.exitCode !== 0) {
    throw new Error(`Failed to init shadcn:\n${shadcnInit.stderr.toString()}`)
  }

  console.log("  Scaffold complete.")
}
```

This is a shell-out function that calls:
1. `bun create astro@latest`
2. `bun astro add react`
3. `bun astro add tailwind`
4. `npx shadcn@latest init`

- [ ] **Step 3: Commit**

```bash
git add src/templates/resolver.ts
git commit -m "feat: rewrite resolver to scaffold Astro+React+Tailwind+shadcn"
```

---

### Task 5: New — Block Installer

**Files:**
- Create: `src/templates/block-installer.ts`

Wraps `npx shadcn add <block-name>` for each block in the manifest.

- [ ] **Step 1: Create src/templates/block-installer.ts**

```ts
import { $ } from "bun"
import type { BlockManifestEntry } from "../types"

export async function installBlock(
  siteDir: string,
  blockName: string
): Promise<void> {
  console.log(`    Installing block: ${blockName}`)

  const result = await $`npx shadcn@latest add ${blockName} --yes --overwrite`.cwd(siteDir).nothrow()

  if (result.exitCode !== 0) {
    console.warn(`    [warn] Could not install block "${blockName}":\n${result.stderr.toString()}`)
    throw new Error(`Failed to install block "${blockName}"`)
  }
}

export async function installBlocks(
  siteDir: string,
  blocks: BlockManifestEntry[]
): Promise<void> {
  console.log("  Installing shadcn blocks...")

  for (const block of blocks) {
    await installBlock(siteDir, block.name)
  }

  console.log(`  ${blocks.length} blocks installed.`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/templates/block-installer.ts
git commit -m "feat: add shadcn block installer"
```

---

### Task 6: New — Page Builder

**Files:**
- Create: `src/templates/page-builder.ts`
- Create: `src/templates/page-builder.test.ts`

The page builder reads installed blocks and generates `src/pages/index.astro` that composes them in order. It also writes the LLM-filled content to block source files.

The LLM receives installed block source + manifest + business data and returns modified block files. The page builder writes those files and generates the page.

- [ ] **Step 1: Write failing tests**

```ts
// src/templates/page-builder.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { buildPage, readBlockFiles } from "./page-builder"
import type { TemplateManifest, ContentPayload } from "../types"

const TEMP_SITE = join(import.meta.dirname, "../../test-tmp-page-builder")

const manifest: TemplateManifest = {
  name: "test-template",
  description: "test",
  types: ["*"],
  blocks: [
    { name: "hero-01", optional: false, fields: { heading: { type: "string" } } },
    { name: "testimonial-01", optional: true, fields: { heading: { type: "string" } } },
    { name: "footer-01", optional: false, fields: { business_name: { type: "string" } } },
  ],
}

const filledFiles: Record<string, string> = {
  "src/components/hero-01.tsx": 'export default function Hero01() { return <h1>Fresh Bread</h1> }',
  "src/components/testimonial-01.tsx": 'export default function Testimonial01() { return <div>Testimonials</div> }',
  "src/components/footer-01.tsx": 'export default function Footer01() { return <footer>Lucas Bakery</footer> }',
}

beforeAll(() => {
  rmSync(TEMP_SITE, { recursive: true, force: true })
  mkdirSync(join(TEMP_SITE, "src", "pages"), { recursive: true })
  mkdirSync(join(TEMP_SITE, "src", "components"), { recursive: true })
  for (const [path, content] of Object.entries(filledFiles)) {
    writeFileSync(join(TEMP_SITE, path), content)
  }
})

afterAll(() => {
  if (existsSync(TEMP_SITE)) rmSync(TEMP_SITE, { recursive: true, force: true })
})

describe("page builder", () => {
  it("builds index.astro with all non-null blocks", async () => {
    const content: ContentPayload = {
      "hero-01": { heading: "Fresh Bread" },
      "testimonial-01": { heading: "What Customers Say" },
      "footer-01": { business_name: "Lucas Bakery" },
    }

    await buildPage(TEMP_SITE, manifest, content)
    const page = await Bun.file(join(TEMP_SITE, "src", "pages", "index.astro")).text()
    expect(page).toContain("hero-01")
    expect(page).toContain("testimonial-01")
    expect(page).toContain("footer-01")
  })

  it("skips optional blocks with null content", async () => {
    const content: ContentPayload = {
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
    const content: ContentPayload = {
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/templates/page-builder.test.ts`
Expected: module not found.

- [ ] **Step 3: Implement src/templates/page-builder.ts**

```ts
import { join } from "node:path"
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import type { TemplateManifest, ContentPayload } from "../types"

function kebabToPascal(kebab: string): string {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

export async function readBlockFiles(siteDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const srcDir = join(siteDir, "src")

  try {
    await readdir(srcDir)
  } catch {
    return files
  }

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue
        await walk(fullPath)
      } else if (
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".astro") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".json")
      ) {
        const relPath = fullPath.replace(siteDir, "").replace(/^\//, "")
        files[relPath] = await readFile(fullPath, "utf-8")
      }
    }
  }

  await walk(srcDir)
  return files
}

export async function writeBlockFiles(
  siteDir: string,
  fileMap: Record<string, string>
): Promise<void> {
  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content)
  }
}

export async function buildPage(
  siteDir: string,
  manifest: TemplateManifest,
  content: ContentPayload
): Promise<void> {
  const activeBlocks = manifest.blocks.filter(
    (block) => content[block.name] !== null
  )

  const imports = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `import ${componentName} from "@/components/${block.name}"`
  })

  const components = activeBlocks.map((block) => {
    const componentName = kebabToPascal(block.name)
    return `    <${componentName} />`
  })

  const page = `---
import Layout from "../layouts/Layout.astro"
${imports.join("\n")}
---

<Layout>
${components.join("\n")}
</Layout>
`

  const pagesDir = join(siteDir, "src", "pages")
  await mkdir(pagesDir, { recursive: true })
  await writeFile(join(pagesDir, "index.astro"), page)

  console.log(`  Page built with ${activeBlocks.length}/${manifest.blocks.length} blocks.`)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/templates/page-builder.test.ts`
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/templates/page-builder.ts src/templates/page-builder.test.ts
git commit -m "feat: add page builder that composes blocks from manifest"
```

---

### Task 7: Update LLM Prompts

**Files:**
- Modify: `src/llm/prompts.ts`

Replace the `GENERATE_SYSTEM_PROMPT` with one that expects manifest + block files + business data. Add a new `CLASSIFY_BUSINESS_TYPE_PROMPT` and helper.

- [ ] **Step 1: Read current src/llm/prompts.ts, then replace the generate prompt section**

The file currently has `GENERATE_SYSTEM_PROMPT`, `SUMMARIZE_PROMPT`, `ITERATE_CLASSIFY_PROMPT`, `ITERATE_EDIT_PROMPT` and their helpers. We need to:
1. Replace the generate prompt and its helper
2. Add a business type classification section
3. Keep everything else (summarize, iterate prompts) unchanged

- [ ] **Step 2: Read the current file first**

Run: `cat src/llm/prompts.ts` to see current contents.

Then replace the generate section. Full updated file:

```ts
// =====================
// Generate (v2 — manifest-driven, LLM edits block source files)
// =====================

export const GENERATE_SYSTEM_PROMPT = `You are a website content filler. You will receive:
1. A template manifest listing shadcn blocks and their customizable fields
2. The source code of every file in the installed blocks
3. Structured business data extracted from a scraped website

Your task:
1. For each block in the manifest, fill its content with real business data
2. Return the modified block source files with hardcoded text/images replaced

Rules:
- Look at each block's source code to understand its structure
- Replace hardcoded text (headings, paragraphs, labels, etc.) with business data
- Replace placeholder image src values with actual image URLs from the business data
- For OPTIONAL blocks (optional: true in manifest): if the business data has zero relevant content for that block, skip it — do not include it in your response
- Never modify structural code (imports, component signatures, className, layout JSX)
- Only modify: text content between JSX tags, src/href attributes, alt text
- Keep all existing Astro/React templating, imports, and structure intact
- Respond ONLY with valid JSON. No markdown, no explanation.

Response format:
{
  "src/components/hero-01.tsx": "<full modified file content>",
  "src/components/features-01.tsx": "<full modified file content>",
  "src/components/footer-01.tsx": "<full modified file content>"
}

Only include files you modified. Do not include files you did not touch.`

export function buildGenerateUserMessage(
  manifest: object,
  blockFiles: Record<string, string>,
  businessData: object
): string {
  return JSON.stringify({
    manifest,
    block_files: blockFiles,
    business_data: businessData,
    instruction: "Fill the block files with the provided business data. Return ONLY the modified files.",
  }, null, 2)
}

// =====================
// Business Type Classification
// =====================

export const CLASSIFY_BUSINESS_TYPE_PROMPT = `You are a business classifier. Given basic information about a business from its website, classify it into a single category.

Categories (choose ONE):
- restaurant (restaurants, dining, food service)
- cafe (coffee shops, cafes, bakeries)
- retail (shops, stores, e-commerce)
- law-firm (legal services, attorneys)
- medical (doctors, clinics, dental, healthcare)
- real-estate (agents, agencies, property management)
- automotive (repair, dealerships, car services)
- beauty (salons, spas, barbers)
- gym (fitness, yoga, personal training)
- contractor (construction, plumbing, electrical, home services)
- tech (software, IT services, consulting)
- creative (design, photography, marketing)
- education (tutoring, schools, courses)
- nonprofit (charities, community organizations)
- other (anything not listed above)

Respond with ONLY a single word (the category name). No punctuation, no explanation.`

export function buildClassifyBusinessTypeMessage(
  businessName: string,
  description: string,
  sectionHeadings: string[]
): string {
  return JSON.stringify({
    business_name: businessName,
    description,
    sections: sectionHeadings,
    instruction: "What type of business is this? Respond with one word.",
  })
}

// =====================
// Summarize (unchanged)
// =====================

export const SUMMARIZE_PROMPT = `You are a content extractor. Given the raw text content of a scraped website, extract structured business data.

Return ONLY valid JSON matching this schema:
{
  "business_name": "string",
  "tagline": "string",
  "description": "string",
  "sections": [
    {
      "type": "hero" | "features" | "cta" | "about" | "contact" | "services" | "testimonials" | "other",
      "heading": "string",
      "body": "string",
      "image_url": "string or null",
      "items": [{"title": "string", "description": "string"}] or null
    }
  ],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null"
  },
  "color_hints": ["#hexcolor"],
  "social_links": [{"platform": "string", "url": "string"}]
}

Rules:
- Extract ALL discoverable business information
- Infer section types from content structure (hero = main heading + tagline, features = list of offerings, etc.)
- Extract colors from any inline styles, CSS class names, or brand elements you can identify
- Keep the description concise (1-2 sentences)
- Do not invent information not present in the source`

// =====================
// Iterate (unchanged)
// =====================

export const ITERATE_CLASSIFY_PROMPT = `You are a classifier. Given a user prompt about editing a website, determine if the request is within your scope.

IN SCOPE (respond "yes"):
- Changing text content (headings, paragraphs, taglines, descriptions)
- Replacing images or image URLs
- Changing colors, fonts, or styling
- Reordering sections or components
- Updating contact information (email, phone, address)
- Adding or removing simple sections using existing blocks

OUT OF SCOPE (respond "no"):
- Adding authentication, login, or user accounts
- Adding a database or backend
- Adding payment processing or e-commerce
- Adding complex interactive features (search, filtering, real-time chat)
- Changing the framework or build system
- Adding API integrations

Respond with ONLY "yes" or "no".`

export const ITERATE_EDIT_PROMPT = `You are a website editor. You will receive:
1. The current content of every file in the website
2. A user's change request

Your task: Apply the requested change and return the modified files as a JSON object where keys are file paths and values are the complete new file contents.

Rules:
- Only modify files that need to change — include unchanged files in the response only if they are affected
- Return the COMPLETE file content, not just the changed lines
- Keep all existing Astro templating, imports, and structure intact
- Make minimal changes — only what the user asked for
- Respond ONLY with valid JSON. No markdown, no explanation.

Format:
{
  "src/pages/index.astro": "<full new file content>"
}`

export function buildIterateClassifyMessage(prompt: string): string {
  return `Classify this website change request:\n\n"${prompt}"`
}

export function buildIterateEditMessage(
  files: Record<string, string>,
  prompt: string
): string {
  return JSON.stringify({
    current_files: files,
    change_request: prompt,
    instruction: "Apply the change request to the files. Return only the files that need modification as a JSON object with file paths as keys and complete new contents as values.",
  }, null, 2)
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: errors only in files we haven't updated yet (generate.ts, iterate.ts still reference old prompt types).

- [ ] **Step 3: Commit**

```bash
git add src/llm/prompts.ts
git commit -m "feat: update LLM prompts for manifest-driven generation"
```

---

### Task 8: Create Business-One Template Manifest

**Files:**
- Create: `templates/business-one/manifest.json`

- [ ] **Step 1: Create templates/business-one/manifest.json**

```json
{
  "name": "business-one",
  "description": "General-purpose small business landing page. Works for most local businesses.",
  "types": ["*"],
  "blocks": [
    {
      "name": "hero-01",
      "optional": false,
      "fields": {
        "heading": { "type": "string", "hint": "Main value proposition, keep under 60 characters" },
        "tagline": { "type": "string", "hint": "Supporting subtitle or slogan, keep under 80 characters" },
        "cta_label": { "type": "string", "hint": "Primary call-to-action button text" },
        "cta_href": { "type": "string", "hint": "Link for the CTA button" },
        "image_src": { "type": "string", "hint": "Hero image URL or path" }
      }
    },
    {
      "name": "feature-section-01",
      "optional": false,
      "fields": {
        "heading": { "type": "string", "hint": "Section heading, e.g. 'What We Offer'" },
        "subtitle": { "type": "string", "hint": "Brief description below the heading" },
        "features": {
          "type": "array",
          "hint": "List of features or services",
          "items": { "title": "string", "description": "string" }
        }
      }
    },
    {
      "name": "cta-01",
      "optional": false,
      "fields": {
        "heading": { "type": "string", "hint": "CTA heading, e.g. 'Ready to Get Started?'" },
        "body": { "type": "string", "hint": "Supporting text for the CTA" },
        "cta_label": { "type": "string", "hint": "Button text" },
        "cta_href": { "type": "string", "hint": "Button link" }
      }
    },
    {
      "name": "testimonial-01",
      "optional": true,
      "fields": {
        "heading": { "type": "string", "hint": "Section heading" },
        "testimonials": {
          "type": "array",
          "hint": "Customer testimonials. Leave empty if none found.",
          "items": { "quote": "string", "author": "string", "role": "string" }
        }
      }
    },
    {
      "name": "footer-01",
      "optional": false,
      "fields": {
        "business_name": { "type": "string" },
        "tagline": { "type": "string" },
        "email": { "type": "string" },
        "phone": { "type": "string" },
        "address": { "type": "string" }
      }
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add templates/business-one/manifest.json
git commit -m "feat: add business-one template manifest"
```

---

### Task 9: Update Generate Command

**Files:**
- Modify: `src/commands/generate.ts`

Rewrite to follow the scrape-first flow. The new flow:
1. Scrape → summarize
2. Classify business type → match template
3. Scaffold Astro project
4. Install shadcn blocks from manifest
5. Read installed block files
6. LLM fill: send manifest + block files + business data → modified files
7. Write modified files, build page
8. Git init, commit, build, deploy

- [ ] **Step 1: Read current file, then replace entirely**

```ts
import { join } from "node:path"
import { existsSync } from "node:fs"
import { init, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { crawl } from "../scraper/crawler"
import { summarize } from "../scraper/summarizer"
import { discoverTemplates, matchTemplate, pickRandomTemplate } from "../templates/registry"
import { scaffoldSite } from "../templates/resolver"
import { installBlocks } from "../templates/block-installer"
import { buildPage, readBlockFiles, writeBlockFiles } from "../templates/page-builder"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import {
  GENERATE_SYSTEM_PROMPT,
  buildGenerateUserMessage,
  CLASSIFY_BUSINESS_TYPE_PROMPT,
  buildClassifyBusinessTypeMessage,
} from "../llm/prompts"

function slugify(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/\./g, "-")
  } catch {
    throw new Error(`Invalid URL: "${url}"`)
  }
}

export async function generate(url: string, templateName?: string): Promise<void> {
  const slug = slugify(url)
  const siteDir = join(process.cwd(), "sites", slug)

  if (existsSync(siteDir)) {
    throw new Error(`Site "${slug}" already exists at sites/${slug}`)
  }

  console.log(`\n=== Generate: ${url} -> ${slug} ===\n`)

  // 1. Scrape
  console.log("  Crawling source website...")
  const crawlResult = await crawl(url)

  const provider = await createProvider()

  console.log("  Summarizing crawl data...")
  const businessData = await summarize(crawlResult, provider)

  // 2. Template selection
  const templatesRoot = join(process.cwd(), "templates")
  const templates = await discoverTemplates(templatesRoot)

  if (templates.length === 0) {
    throw new Error("No templates found in templates/ directory")
  }

  let template
  if (templateName) {
    template = templates.find((t) => t.name === templateName)
    if (!template) throw new Error(`Template "${templateName}" not found`)
  } else {
    // Classify business type for auto-selection
    console.log("  Classifying business type...")
    const classifyResponse = await provider.generate(
      CLASSIFY_BUSINESS_TYPE_PROMPT,
      buildClassifyBusinessTypeMessage(
        businessData.business_name,
        businessData.description,
        businessData.sections.map((s) => s.type)
      )
    )
    const businessType = classifyResponse.trim().toLowerCase().replace(/[^a-z-]/g, "")
    console.log(`  Business type: ${businessType}`)

    const matches = matchTemplate(templates, businessType)
    template = pickRandomTemplate(matches.length > 0 ? matches : templates)
  }

  console.log(`  Using template: ${template.manifest.name} (${template.manifest.blocks.length} blocks)`)

  // 3. Scaffold site
  console.log("  Scaffolding site...")
  await scaffoldSite(siteDir)

  // 4. Install blocks from manifest
  await installBlocks(siteDir, template.manifest.blocks)

  // 5. Read installed block files for LLM
  console.log("  Reading installed block files...")
  const blockFiles = await readBlockFiles(siteDir)

  // 6. LLM fills content
  console.log("  Filling block content with business data...")
  const userMessage = buildGenerateUserMessage(
    template.manifest,
    blockFiles,
    businessData
  )
  const llmResponse = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let fileMap: Record<string, string>
  try {
    const jsonStart = llmResponse.indexOf("{")
    const jsonEnd = llmResponse.lastIndexOf("}") + 1
    fileMap = JSON.parse(llmResponse.slice(jsonStart, jsonEnd))
  } catch {
    throw new Error("LLM returned malformed response — unable to parse file map")
  }

  // 7. Write modified files and build page
  console.log("  Writing modified block files...")
  await writeBlockFiles(siteDir, fileMap)

  // Build page using block presence in fileMap as activation signal
  const content: Record<string, unknown | null> = {}
  for (const block of template.manifest.blocks) {
    const wasModified = Object.keys(fileMap).some((path) =>
      path.includes(`/${block.name}`)
    )
    content[block.name] = wasModified ? { activated: true } : null
  }
  await buildPage(siteDir, template.manifest, content as Record<string, Record<string, unknown> | null>)

  // 8. Git init & commit
  console.log("  Initializing git repo...")
  await init(siteDir)
  await commitAll(siteDir, "Initial site generated from template")

  // 9. Build & deploy
  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  await deploy(siteDir, "main", slug)

  console.log(`\n=== Done! Site "${slug}" is live ===\n`)
}
```

**Note:** The ContentPayload type has `Record<string, unknown> | null` per block. The page builder checks for `null` to skip optional blocks. Since the LLM modifies source files directly (not JSON), we detect block activation by whether the block's files appear in the LLM's output fileMap.

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: may show errors in iterate.ts (still references old flow). We'll fix that next.

- [ ] **Step 3: Commit**

```bash
git add src/commands/generate.ts
git commit -m "feat: rewrite generate for scrape-first manifest flow"
```

---

### Task 10: Update Iterate Command

**Files:**
- Modify: `src/commands/iterate.ts`

Iterate now reads/writes block source files (`.tsx`, `.astro`) instead of just `.astro`. The flow is conceptually the same — classify scope, read files, LLM edit, write files, commit, build, deploy. The `readAllFiles` function just needs to include `.tsx` (it already does).

The current iterate.ts already reads `.tsx` files in its `readAllFiles` function:
```
entry.name.endsWith(".tsx")
```

So the only change needed is verifying it works with the new project structure (shadcn blocks in `src/components/`).

- [ ] **Step 1: Verify current iterate.ts handles .tsx files**

Read the file and confirm it reads `.tsx` extensions.

- [ ] **Step 2: No code changes needed if .tsx is already covered**

Run `bun test` to verify no regressions.

- [ ] **Step 3: Commit (only if changes were needed)**

```bash
git add src/commands/iterate.ts
git commit -m "chore: verify iterate works with new block-based sites"
```

---

### Task 11: Final — Typecheck and Test Suite

- [ ] **Step 1: Run full test suite**

Run: `bun test`
Expected: all tests pass. Fix any regressions from renamed/removed modules.

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: no errors. Fix any type issues.

- [ ] **Step 3: Fix any issues and commit**

```bash
git add -A
git commit -m "chore: fix type and test regressions from v2 migration"
```

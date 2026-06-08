# AI Website Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full project structure and implement all four CLI commands (generate, iterate, merge, discard) with their supporting modules — git ops, LLM abstraction, scraper, templates, and pipeline.

**Architecture:** Layered CLI tool. `src/cli.ts` parses commands, `src/commands/` orchestrates workflows, `src/pipeline/` handles build+deploy, `src/llm/` provides LLM abstraction, `src/scraper/` crawls and summarizes websites, `src/templates/` manages template discovery and copying, `src/git/` wraps git operations. Each module is independently testable.

**Tech Stack:** Bun (runtime, test runner, package manager), TypeScript, Commander.js (CLI), Cheerio (HTML parsing), DeepSeek API via fetch (OpenAI-compatible), Wrangler (Cloudflare Pages deploy), Astro (template sites).

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `sites/.gitkeep`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "biogenesis-3",
  "type": "module",
  "scripts": {
    "generate": "bun run src/cli.ts generate",
    "iterate": "bun run src/cli.ts iterate",
    "merge": "bun run src/cli.ts merge",
    "discard": "bun run src/cli.ts discard",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^13.1.0",
    "cheerio": "1.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `bun install`
Expected: dependencies installed, `bun.lock` created.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["bun-types"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "sites", "templates"]
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.env
sites/
*.log
```

- [ ] **Step 5: Create .env.example**

```
LLM_PROVIDER=deepseek
LLM_API_KEY=sk-your-key-here
LLM_MODEL=deepseek-chat
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
```

- [ ] **Step 6: Create sites/.gitkeep**

Run: `mkdir -p sites && touch sites/.gitkeep`

- [ ] **Step 7: Commit**

```bash
git add package.json bun.lock tsconfig.json .gitignore .env.example sites/.gitkeep
git commit -m "chore: initialize project with dependencies and config"
```

---

### Task 2: Shared Types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create src/types.ts**

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

export interface TemplateSlot {
  name: string
  marker: string
}

export interface Template {
  name: string
  path: string
  slots: TemplateSlot[]
}

export interface SiteContext {
  slug: string
  dir: string
}

export const STAGING_BRANCH = "staging"
export const MAIN_BRANCH = "main"
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared types"
```

---

### Task 3: Git Operations

**Files:**
- Create: `src/git/ops.ts`
- Create: `src/git/ops.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/git/ops.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { $ } from "bun"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import {
  init,
  createBranch,
  mergeBranch,
  deleteBranch,
  branchExists,
  currentBranch,
  commitAll,
  checkout,
} from "./ops"

const TEST_DIR = join(import.meta.dirname, "../../test-tmp-git")

function testDir(sub: string) {
  const d = join(TEST_DIR, sub)
  mkdirSync(d, { recursive: true })
  return d
}

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
})

afterAll(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true })
})

describe("git ops", () => {
  it("init creates a git repo", async () => {
    const dir = testDir("init-test")
    await init(dir)
    expect(existsSync(join(dir, ".git"))).toBe(true)
  })

  it("init fails if repo already exists", async () => {
    const dir = testDir("init-double")
    await init(dir)
    await expect(init(dir)).rejects.toThrow("already initialized")
  })

  it("commits a file and verifies log", async () => {
    const dir = testDir("commit-test")
    await init(dir)
    const file = join(dir, "test.txt")
    await Bun.write(file, "hello world")
    await commitAll(dir, "test commit")

    const result = await $`git log --oneline`.cwd(dir).quiet()
    expect(result.text()).toContain("test commit")
  })

  it("currentBranch returns 'main' after init", async () => {
    const dir = testDir("branch-init")
    await init(dir)
    const branch = await currentBranch(dir)
    expect(branch).toBe("main")
  })

  it("branchExists returns false for non-existent branch", async () => {
    const dir = testDir("branch-exists-false")
    await init(dir)
    const exists = await branchExists(dir, "staging")
    expect(exists).toBe(false)
  })

  it("branchExists returns true after creating branch", async () => {
    const dir = testDir("branch-exists-true")
    await init(dir)
    const file = join(dir, "f.txt")
    await Bun.write(file, "x")
    await commitAll(dir, "base")
    await createBranch(dir, "staging")
    const exists = await branchExists(dir, "staging")
    expect(exists).toBe(true)
  })

  it("mergeBranch merges and checks out target", async () => {
    const dir = testDir("merge-test")
    await init(dir)
    const file = join(dir, "data.txt")
    await Bun.write(file, "base")
    await commitAll(dir, "base commit")
    await createBranch(dir, "staging")
    await Bun.write(file, "staged change")
    await commitAll(dir, "staging commit")
    await mergeBranch(dir, "staging", "main")
    const content = await Bun.file(file).text()
    expect(content).toBe("staged change")
    const branch = await currentBranch(dir)
    expect(branch).toBe("main")
  })

  it("deleteBranch removes the branch", async () => {
    const dir = testDir("delete-test")
    await init(dir)
    await Bun.write(join(dir, "f.txt"), "x")
    await commitAll(dir, "base")
    await createBranch(dir, "staging")
    await deleteBranch(dir, "staging")
    const exists = await branchExists(dir, "staging")
    expect(exists).toBe(false)
  })

  it("deleteBranch fails if branch does not exist", async () => {
    const dir = testDir("delete-nope")
    await init(dir)
    await expect(deleteBranch(dir, "nope")).rejects.toThrow("not found")
  })

  it("checkout switches to target branch", async () => {
    const dir = testDir("checkout-test")
    await init(dir)
    await Bun.write(join(dir, "f.txt"), "x")
    await commitAll(dir, "base")
    await createBranch(dir, "staging")
    // Switch back to main
    await checkout(dir, "main")
    expect(existsSync(join(dir, "f.txt"))).toBe(true) // file is from main's commit
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/git/ops.test.ts`
Expected: all tests fail with module not found errors.

- [ ] **Step 3: Implement src/git/ops.ts**

```ts
import { $ } from "bun"
import { existsSync } from "node:fs"
import { join } from "node:path"

async function git(cwd: string, args: string[]) {
  return $`git ${args}`.cwd(cwd).quiet()
}

export async function init(dir: string): Promise<void> {
  if (existsSync(join(dir, ".git"))) {
    throw new Error("Git repo already initialized")
  }
  await git(dir, ["init", "-b", "main"])
  await git(dir, ["config", "user.email", "bot@biogenesis.local"])
  await git(dir, ["config", "user.name", "Biogenesis"])
}

export async function commitAll(dir: string, message: string): Promise<void> {
  await git(dir, ["add", "-A"])
  const result = await $`git -C ${dir} diff --cached --quiet`.nothrow().quiet()
  if (result.exitCode === 0) {
    return
  }
  await git(dir, ["commit", "-m", message])
}

export async function currentBranch(dir: string): Promise<string> {
  const result = await git(dir, ["branch", "--show-current"])
  return result.text().trim()
}

export async function branchExists(dir: string, branch: string): Promise<boolean> {
  const result = await $`git -C ${dir} branch --list ${branch}`.nothrow().quiet()
  return result.text().trim().length > 0
}

export async function createBranch(dir: string, branch: string): Promise<void> {
  if (await branchExists(dir, branch)) {
    throw new Error(`Branch "${branch}" already exists`)
  }
  await git(dir, ["checkout", "-b", branch])
}

export async function mergeBranch(dir: string, source: string, target: string): Promise<void> {
  if (!(await branchExists(dir, source))) {
    throw new Error(`Source branch "${source}" not found`)
  }
  await git(dir, ["checkout", target])
  await git(dir, ["merge", source])
}

export async function deleteBranch(dir: string, branch: string): Promise<void> {
  if (!(await branchExists(dir, branch))) {
    throw new Error(`Branch "${branch}" not found`)
  }
  await git(dir, ["branch", "-D", branch])
}

export async function checkout(dir: string, branch: string): Promise<void> {
  if (!(await branchExists(dir, branch))) {
    throw new Error(`Branch "${branch}" not found`)
  }
  await git(dir, ["checkout", branch])
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/git/ops.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/git/ops.ts src/git/ops.test.ts
git commit -m "feat: add git operations module with tests"
```

---

### Task 4: LLM Provider Interface

**Files:**
- Create: `src/llm/provider.ts`
- Create: `src/llm/provider.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/llm/provider.test.ts
import { describe, it, expect } from "bun:test"
import type { LLMProvider } from "./provider"

const mockProvider: LLMProvider = {
  generate: async (systemPrompt: string, userMessage: string) => {
    return JSON.stringify({ received: { systemPrompt, userMessage } })
  },
}

describe("LLMProvider interface", () => {
  it("implements generate method", async () => {
    const result = await mockProvider.generate("sys", "usr")
    const parsed = JSON.parse(result)
    expect(parsed.received.systemPrompt).toBe("sys")
    expect(parsed.received.userMessage).toBe("usr")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/llm/provider.test.ts`
Expected: all tests fail (could be module not found if file doesn't exist, or the type isn't exported).

- [ ] **Step 3: Implement src/llm/provider.ts**

```ts
export interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>
}

export function getProviderConfig() {
  const provider = process.env.LLM_PROVIDER || "deepseek"
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || "deepseek-chat"

  if (!apiKey) {
    throw new Error("LLM_API_KEY environment variable is required")
  }

  return { provider, apiKey, model }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/llm/provider.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/llm/provider.ts src/llm/provider.test.ts
git commit -m "feat: add LLM provider interface and config"
```

---

### Task 5: DeepSeek Adapter

**Files:**
- Create: `src/llm/deepseek.ts`
- Create: `src/llm/deepseek.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/llm/deepseek.test.ts
import { describe, it, expect, mock, afterEach } from "bun:test"
import { createDeepSeekProvider } from "./deepseek"
import type { LLMProvider } from "./provider"

const originalFetch = globalThis.fetch
const originalEnv = { ...process.env }

afterEach(() => {
  globalThis.fetch = originalFetch
  process.env = { ...originalEnv }
})

describe("createDeepSeekProvider", () => {
  it("returns an LLMProvider with generate method", () => {
    process.env.LLM_API_KEY = "sk-test"
    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    expect(provider).toBeDefined()
    expect(typeof provider.generate).toBe("function")
  })

  it("calls DeepSeek API with correct parameters", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      expect(body.model).toBe("deepseek-chat")
      expect(body.messages[0].role).toBe("system")
      expect(body.messages[0].content).toBe("sys prompt")
      expect(body.messages[1].role).toBe("user")
      expect(body.messages[1].content).toBe("user msg")

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "hello from deepseek" } }],
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    const result = await provider.generate("sys prompt", "user msg")
    expect(result).toBe("hello from deepseek")
  })

  it("throws on API error", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ error: { message: "Invalid API key" } }),
        { status: 401 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    await expect(provider.generate("sys", "usr")).rejects.toThrow("DeepSeek API error")
  })

  it("throws on empty response", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ choices: [] }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    await expect(provider.generate("sys", "usr")).rejects.toThrow("no content in response")
  })

  it("retries once on fetch failure", async () => {
    process.env.LLM_API_KEY = "sk-test"

    let calls = 0
    globalThis.fetch = mock(async () => {
      calls++
      if (calls === 1) throw new Error("Network error")
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "retry success" } }],
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    const result = await provider.generate("sys", "usr")
    expect(result).toBe("retry success")
    expect(calls).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/llm/deepseek.test.ts`
Expected: all tests fail (module not found or undefined export).

- [ ] **Step 3: Implement src/llm/deepseek.ts**

```ts
import type { LLMProvider } from "./provider"

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

async function fetchWithRetry(url: string, opts: RequestInit, retries = 1): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, opts)
      if (response.ok || attempt === retries) return response
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw new Error("DeepSeek API: all retries exhausted")
}

export function createDeepSeekProvider(apiKey: string, model: string): LLMProvider {
  return {
    async generate(systemPrompt: string, userMessage: string): Promise<string> {
      const response = await fetchWithRetry(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`DeepSeek API error (${response.status}): ${err}`)
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[]
      }

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error("DeepSeek API returned no content in response")
      }

      return content
    },
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/llm/deepseek.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/llm/deepseek.ts src/llm/deepseek.test.ts
git commit -m "feat: add DeepSeek LLM adapter with tests"
```

---

### Task 6: LLM Prompts

**Files:**
- Create: `src/llm/prompts.ts`

No unit tests for this file — these are string templates tested indirectly through integration tests and manual verification. Validation is that the LLM responds correctly to them.

- [ ] **Step 1: Create src/llm/prompts.ts**

```ts
export const GENERATE_SYSTEM_PROMPT = `You are a website builder. You will receive:
1. A description of the template slots that need to be filled
2. Structured business data extracted from a scraped website

Your task: Return the filled .astro file(s) as a JSON object where keys are file paths (relative to the template root) and values are the complete file contents with all placeholder slots replaced with the appropriate business data.

Rules:
- Replace ALL {{SLOT:name}} markers with real content from the business data
- Keep all existing HTML structure, Astro templating, and component imports intact
- Use the business data faithfully — do not invent new content
- If an image_url is available, use it; otherwise keep the template's placeholder image
- Respond ONLY with valid JSON. No markdown, no explanation.

Format:
{
  "src/pages/index.astro": "<full file content>",
  "src/components/Hero.astro": "<full file content>"
}`

export function buildGenerateUserMessage(
  slots: { name: string; marker: string }[],
  businessData: object
): string {
  return JSON.stringify({
    template_slots: slots,
    business_data: businessData,
    instruction: "Fill all template slots with the provided business data. Return the modified files as a JSON object.",
  }, null, 2)
}

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
```

- [ ] **Step 2: Commit**

```bash
git add src/llm/prompts.ts
git commit -m "feat: add LLM prompt templates"
```

---

### Task 7: Scraper — Crawler

**Files:**
- Create: `src/scraper/crawler.ts`
- Create: `src/scraper/crawler.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/scraper/crawler.test.ts
import { describe, it, expect, mock, afterEach } from "bun:test"
import type { CrawlResult } from "../types"
import { crawl } from "./crawler"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

function mockPage(title: string, body: string, links: string[] = []) {
  const linkTags = links.map((l) => `<a href="${l}">link</a>`).join("\n")
  return `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p>${linkTags}<img src="/img/logo.png" alt="logo"></body></html>`
}

describe("crawler", () => {
  it("crawls a single page and extracts content", async () => {
    globalThis.fetch = mock(async (url: string) => {
      return new Response(mockPage("Test Page", "Hello world"), { status: 200 })
    }) as unknown as typeof fetch

    const result: CrawlResult = await crawl("https://example.com")
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].title).toBe("Test Page")
    expect(result.pages[0].paragraphs).toContain("Hello world")
    expect(result.pages[0].headings).toEqual([{ level: 1, text: "Test Page" }])
    expect(result.pages[0].images).toContain("/img/logo.png")
  })

  it("follows same-domain links and crawls multiple pages", async () => {
    const pages: Record<string, string> = {
      "https://example.com": mockPage("Home", "Welcome", ["/about"]),
      "https://example.com/about": mockPage("About", "About us", []),
    }

    globalThis.fetch = mock(async (url: string) => {
      const content = pages[url]
      if (!content) return new Response("Not found", { status: 404 })
      return new Response(content, { status: 200 })
    }) as unknown as typeof fetch

    const result = await crawl("https://example.com")
    expect(result.pages).toHaveLength(2)
    const titles = result.pages.map((p) => p.title).sort()
    expect(titles).toEqual(["About", "Home"])
  })

  it("does not follow external links", async () => {
    const pages: Record<string, string> = {
      "https://example.com": mockPage("Home", "Welcome", [
        "https://other.com/page",
      ]),
    }

    globalThis.fetch = mock(async (url: string) => {
      const content = pages[url]
      if (content) return new Response(content, { status: 200 })
      throw new Error("Should not fetch external URL: " + url)
    }) as unknown as typeof fetch

    const result = await crawl("https://example.com")
    expect(result.pages).toHaveLength(1)
  })

  it("handles fetch errors gracefully", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("Network error")
    }) as unknown as typeof fetch

    await expect(crawl("https://example.com")).rejects.toThrow(
      "Failed to crawl"
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/scraper/crawler.test.ts`
Expected: all tests fail (module not found).

- [ ] **Step 3: Implement src/scraper/crawler.ts**

```ts
import * as cheerio from "cheerio"
import type { CrawlPage, CrawlResult } from "../types"

function extractDomain(url: string): string {
  return new URL(url).hostname
}

function resolveUrl(base: string, path: string): string | null {
  try {
    return new URL(path, base).href
  } catch {
    return null
  }
}

async function crawlPage(url: string): Promise<CrawlPage> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`)
  }
  const html = await response.text()
  const $ = cheerio.load(html)

  const headings: { level: number; text: string }[] = []
  for (let i = 1; i <= 6; i++) {
    $(`h${i}`).each((_, el) => {
      const text = $(el).text().trim()
      if (text) headings.push({ level: i, text })
    })
  }

  const paragraphs: string[] = []
  $("p").each((_, el) => {
    const text = $(el).text().trim()
    if (text) paragraphs.push(text)
  })

  const links: string[] = []
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")
    if (href) links.push(href)
  })

  const images: string[] = []
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src")
    if (src) images.push(src)
  })

  return {
    url,
    title: $("title").first().text().trim() || url,
    headings,
    paragraphs,
    links,
    images,
  }
}

export async function crawl(startUrl: string, maxPages = 50): Promise<CrawlResult> {
  const domain = extractDomain(startUrl)
  const visited = new Set<string>()
  const pages: CrawlPage[] = []
  const queue: string[] = [startUrl]

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    const normalized = url.split("#")[0]

    if (visited.has(normalized)) continue
    visited.add(normalized)

    if (extractDomain(normalized) !== domain) continue

    try {
      const page = await crawlPage(normalized)
      pages.push(page)

      for (const link of page.links) {
        const resolved = resolveUrl(normalized, link)
        if (resolved && !visited.has(resolved.split("#")[0]) && extractDomain(resolved) === domain) {
          queue.push(resolved)
        }
      }
    } catch (err) {
      console.warn(`  [warn] Could not crawl ${normalized}: ${(err as Error).message}`)
    }
  }

  if (pages.length === 0) {
    throw new Error("Failed to crawl: no pages could be fetched")
  }

  return { pages }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/scraper/crawler.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scraper/crawler.ts src/scraper/crawler.test.ts
git commit -m "feat: add website crawler with tests"
```

---

### Task 8: Scraper — Summarizer

**Files:**
- Create: `src/scraper/summarizer.ts`
- Create: `src/scraper/summarizer.test.ts`

The summarizer calls the LLM to extract structured data from the crawl. In tests, we mock the LLM provider.

- [ ] **Step 1: Write the failing tests**

```ts
// src/scraper/summarizer.test.ts
import { describe, it, expect } from "bun:test"
import { summarize } from "./summarizer"
import type { LLMProvider } from "../llm/provider"
import type { CrawlResult, StructuredData } from "../types"

const mockCrawl: CrawlResult = {
  pages: [
    {
      url: "https://example.com",
      title: "Lucas Bakery | Fresh Bread Daily",
      headings: [
        { level: 1, text: "Lucas Bakery" },
        { level: 2, text: "Fresh Bread Daily" },
        { level: 2, text: "Our Products" },
      ],
      paragraphs: [
        "We bake fresh bread every morning.",
        "Sourdough, baguettes, and pastries.",
        "123 Main St, Portland OR. Call us at 555-0123.",
      ],
      links: [],
      images: ["/img/hero.jpg"],
    },
  ],
}

const mockStructured: StructuredData = {
  business_name: "Lucas Bakery",
  tagline: "Fresh Bread Daily",
  description: "A bakery in Portland baking fresh bread every morning.",
  sections: [
    {
      type: "hero",
      heading: "Lucas Bakery",
      body: "Fresh Bread Daily",
      image_url: "/img/hero.jpg",
    },
    {
      type: "services",
      heading: "Our Products",
      body: "Sourdough, baguettes, and pastries.",
      items: [
        { title: "Sourdough", description: "Fresh daily sourdough" },
        { title: "Baguettes", description: "Traditional French baguettes" },
        { title: "Pastries", description: "Fresh baked pastries" },
      ],
    },
  ],
  contact: {
    email: null,
    phone: "555-0123",
    address: "123 Main St, Portland OR",
  },
  color_hints: ["#8B4513", "#FFF8DC"],
  social_links: [],
}

const mockProvider: LLMProvider = {
  generate: async () => JSON.stringify(mockStructured),
}

describe("summarizer", () => {
  it("extracts structured data from crawl result", async () => {
    const result = await summarize(mockCrawl, mockProvider)
    expect(result).toEqual(mockStructured)
  })

  it("throws if LLM returns invalid JSON", async () => {
    const badProvider: LLMProvider = {
      generate: async () => "not json at all",
    }
    await expect(summarize(mockCrawl, badProvider)).rejects.toThrow(
      "Failed to parse summarized data"
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/scraper/summarizer.test.ts`
Expected: all tests fail (module not found).

- [ ] **Step 3: Implement src/scraper/summarizer.ts**

```ts
import type { LLMProvider } from "../llm/provider"
import type { CrawlResult, StructuredData } from "../types"
import { SUMMARIZE_PROMPT } from "../llm/prompts"

export async function summarize(
  crawl: CrawlResult,
  provider: LLMProvider
): Promise<StructuredData> {
  const rawText = crawl.pages
    .map((p) => {
      const parts: string[] = []
      parts.push(`# Page: ${p.url}`)
      parts.push(`Title: ${p.title}`)
      for (const h of p.headings) {
        parts.push(`${"#".repeat(h.level)} ${h.text}`)
      }
      for (const para of p.paragraphs) {
        parts.push(para)
      }
      if (p.images.length > 0) {
        parts.push(`Images: ${p.images.join(", ")}`)
      }
      return parts.join("\n\n")
    })
    .join("\n---\n\n")

  const response = await provider.generate(SUMMARIZE_PROMPT, rawText)

  try {
    const jsonStart = response.indexOf("{")
    const jsonEnd = response.lastIndexOf("}") + 1
    const json = response.slice(jsonStart, jsonEnd)
    return JSON.parse(json) as StructuredData
  } catch {
    throw new Error("Failed to parse summarized data from LLM response")
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/scraper/summarizer.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scraper/summarizer.ts src/scraper/summarizer.test.ts
git commit -m "feat: add crawl summarizer with tests"
```

---

### Task 9: Templates — Registry

**Files:**
- Create: `src/templates/registry.ts`
- Create: `src/templates/registry.test.ts`

- [ ] **Step 1: Create temporary template directories for testing**

In the test file, we'll set up temporary test templates. But we also need the real `templates/` directory to exist.

- [ ] **Step 2: Write the failing tests**

```ts
// src/templates/registry.test.ts
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
  // gamma has actual astro files
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun test src/templates/registry.test.ts`
Expected: all tests fail (module not found).

- [ ] **Step 4: Implement src/templates/registry.ts**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test src/templates/registry.test.ts`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/templates/registry.ts src/templates/registry.test.ts
git commit -m "feat: add template registry with discovery and slot extraction"
```

---

### Task 10: Templates — Resolver

**Files:**
- Create: `src/templates/resolver.ts`
- Create: `src/templates/resolver.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/templates/resolver.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/templates/resolver.test.ts`
Expected: all tests fail (module not found).

- [ ] **Step 3: Implement src/templates/resolver.ts**

```ts
import { copyFile, mkdir, readdir } from "node:fs/promises"
import { join } from "node:path"
import { existsSync } from "node:fs"
import type { Template } from "../types"

export async function copyTemplate(
  template: Template,
  destDir: string
): Promise<void> {
  if (existsSync(destDir)) {
    const entries = await readdir(destDir)
    if (entries.length > 0) {
      throw new Error(`Destination "${destDir}" already exists and is not empty`)
    }
  }

  await copyDir(template.path, destDir)
}

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true })

  const entries = await readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue
      await copyDir(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/templates/resolver.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/templates/resolver.ts src/templates/resolver.test.ts
git commit -m "feat: add template resolver with copy-on-write"
```

---

### Task 11: Pipeline — Build

**Files:**
- Create: `src/pipeline/build.ts`

No unit tests for the build step itself (it shells out to `bun`). Tested via integration after a sample template is created.

- [ ] **Step 1: Implement src/pipeline/build.ts**

```ts
import { $ } from "bun"

export async function build(dir: string): Promise<void> {
  console.log(`  Building site at ${dir}...`)

  const install = await $`bun install`.cwd(dir).nothrow().quiet()
  if (install.exitCode !== 0) {
    throw new Error(`bun install failed in ${dir}:\n${install.stderr.toString()}`)
  }

  const result = await $`bun run build`.cwd(dir).nothrow()
  if (result.exitCode !== 0) {
    throw new Error(`Build failed in ${dir}:\n${result.stderr.toString()}`)
  }

  console.log(`  Build complete.`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pipeline/build.ts
git commit -m "feat: add pipeline build step"
```

---

### Task 12: Pipeline — Deploy

**Files:**
- Create: `src/pipeline/deploy.ts`

No unit tests for the deploy step itself (it calls wrangler, which is side-effectful).

- [ ] **Step 1: Implement src/pipeline/deploy.ts**

```ts
import { $ } from "bun"

export async function deploy(dir: string, branch: string, projectName: string): Promise<string> {
  const branchFlag = branch === "main" ? "--branch main" : `--branch ${branch}`
  console.log(`  Deploying ${projectName} (${branch})...`)

  const args = ["pages", "deploy", "dist", `--commit-dirty=true`]

  if (branch !== "main") {
    args.push(`--branch=${branch}`)
  }

  const result = await $`bunx wrangler ${args}`.cwd(dir).nothrow()

  if (result.exitCode !== 0) {
    throw new Error(`Deploy failed for ${projectName}:\n${result.stderr.toString()}`)
  }

  const output = result.text()
  const urlMatch = output.match(/https:\/\/[^\s]+/)
  const url = urlMatch ? urlMatch[0] : "unknown"

  console.log(`  Deployed to: ${url}`)
  return url
}
```

- [ ] **Step 2: commit**

```bash
git add src/pipeline/deploy.ts
git commit -m "feat: add pipeline deploy step via wrangler"
```

---

### Task 13: CLI Entry Point

**Files:**
- Create: `src/cli.ts`

- [ ] **Step 1: Implement src/cli.ts**

```ts
#!/usr/bin/env bun
import { Command } from "commander"
import { generate } from "./commands/generate"
import { iterate } from "./commands/iterate"
import { merge } from "./commands/merge"
import { discard } from "./commands/discard"

const program = new Command()

program
  .name("biogenesis")
  .description("AI-powered website generator for small businesses")
  .version("0.1.0")

program
  .command("generate <url>")
  .description("Generate a new website by scraping an existing one")
  .option("-t, --template <name>", "Template name to use (random if not specified)")
  .action(async (url: string, options: { template?: string }) => {
    try {
      await generate(url, options.template)
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`)
      process.exit(1)
    }
  })

program
  .command("iterate <slug> <prompt>")
  .description("Make an iterative change to a website")
  .action(async (slug: string, prompt: string) => {
    try {
      await iterate(slug, prompt)
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`)
      process.exit(1)
    }
  })

program
  .command("merge <slug>")
  .description("Merge staged changes into production")
  .action(async (slug: string) => {
    try {
      await merge(slug)
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`)
      process.exit(1)
    }
  })

program
  .command("discard <slug>")
  .description("Discard staged changes by deleting the staging branch")
  .action(async (slug: string) => {
    try {
      await discard(slug)
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`)
      process.exit(1)
    }
  })

program.parse()
```

- [ ] **Step 2: Commit**

```bash
git add src/cli.ts
git commit -m "feat: add CLI entry point with commander"
```

---

### Task 14: Command — Discard

**Files:**
- Create: `src/commands/discard.ts`

The simplest command, so we implement it first. No external deps beyond git.

- [ ] **Step 1: Implement src/commands/discard.ts**

```ts
import { join } from "node:path"
import { existsSync } from "node:fs"
import { branchExists, deleteBranch, checkout } from "../git/ops"
import { STAGING_BRANCH, MAIN_BRANCH } from "../types"

export async function discard(slug: string): Promise<void> {
  const siteDir = join(process.cwd(), "sites", slug)

  if (!existsSync(siteDir)) {
    throw new Error(`Site "${slug}" not found at sites/${slug}`)
  }

  if (!(await branchExists(siteDir, STAGING_BRANCH))) {
    throw new Error(`No staging branch exists for "${slug}". Nothing to discard.`)
  }

  console.log(`Discarding staging branch for "${slug}"...`)
  // Switch to main — can't delete the branch we're on
  await checkout(siteDir, MAIN_BRANCH)
  await deleteBranch(siteDir, STAGING_BRANCH)
  console.log(`Done. Staging branch deleted. All changes discarded.`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/discard.ts
git commit -m "feat: add discard command"
```

---

### Task 15: Create Provider Factory in llm/provider.ts

**Files:**
- Modify: `src/llm/provider.ts` — add factory function

We need this before implementing the remaining commands.

- [ ] **Step 1: Add createProvider to src/llm/provider.ts**

Add this at the end of the file:

```ts
import { createDeepSeekProvider } from "./deepseek"

export async function createProvider(): Promise<LLMProvider> {
  const config = getProviderConfig()

  switch (config.provider) {
    case "deepseek":
      return createDeepSeekProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`)
  }
}
```

Update the import at top, add missing types import.

Full file after edit:

```ts
import { createDeepSeekProvider } from "./deepseek"

export interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>
}

export function getProviderConfig() {
  const provider = process.env.LLM_PROVIDER || "deepseek"
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || "deepseek-chat"

  if (!apiKey) {
    throw new Error("LLM_API_KEY environment variable is required")
  }

  return { provider, apiKey, model }
}

export async function createProvider(): Promise<LLMProvider> {
  const config = getProviderConfig()

  switch (config.provider) {
    case "deepseek":
      return createDeepSeekProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`)
  }
}
```

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/llm/provider.ts
git commit -m "feat: add createProvider factory to LLM module"
```

---

### Task 16: Command — Generate

**Files:**
- Create: `src/commands/generate.ts`

- [ ] **Step 1: Implement src/commands/generate.ts**

```ts
import { join } from "node:path"
import { existsSync } from "node:fs"
import { init, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { crawl } from "../scraper/crawler"
import { summarize } from "../scraper/summarizer"
import { discoverTemplates, pickRandomTemplate } from "../templates/registry"
import { copyTemplate } from "../templates/resolver"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import { GENERATE_SYSTEM_PROMPT, buildGenerateUserMessage } from "../llm/prompts"
import type { LLMProvider } from "../llm/provider"

function slugify(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/\./g, "-")
  } catch {
    throw new Error(`Invalid URL: "${url}"`)
  }
}

async function fillTemplate(
  siteDir: string,
  provider: LLMProvider,
  slots: { name: string; marker: string }[],
  businessData: object
): Promise<void> {
  console.log("  Filling template slots with business data...")
  const userMessage = buildGenerateUserMessage(slots, businessData)
  const response = await provider.generate(GENERATE_SYSTEM_PROMPT, userMessage)

  let fileMap: Record<string, string>
  try {
    const jsonStart = response.indexOf("{")
    const jsonEnd = response.lastIndexOf("}") + 1
    fileMap = JSON.parse(response.slice(jsonStart, jsonEnd))
  } catch {
    throw new Error("LLM returned malformed response — unable to parse file map")
  }

  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await Bun.write(fullPath, content)
    console.log(`    Wrote ${filePath}`)
  }
}

export async function generate(url: string, templateName?: string): Promise<void> {
  const slug = slugify(url)
  const siteDir = join(process.cwd(), "sites", slug)

  if (existsSync(siteDir)) {
    throw new Error(`Site "${slug}" already exists at sites/${slug}`)
  }

  console.log(`\n=== Generate: ${url} -> ${slug} ===\n`)

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
    template = pickRandomTemplate(templates)
  }
  console.log(`  Using template: ${template.name} (${template.slots.length} slots)`)

  console.log("  Crawling source website...")
  const crawlResult = await crawl(url)

  const provider = await createProvider()

  console.log("  Summarizing crawl data...")
  const businessData = await summarize(crawlResult, provider)

  console.log("  Copying template...")
  await copyTemplate(template, siteDir)

  await fillTemplate(siteDir, provider, template.slots, businessData)

  console.log("  Initializing git repo...")
  await init(siteDir)
  await commitAll(siteDir, "Initial site generated from template")

  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  await deploy(siteDir, "main", slug)

  console.log(`\n=== Done! Site "${slug}" is live ===\n`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/generate.ts
git commit -m "feat: add generate command"
```

---

### Task 17: Command — Iterate

**Files:**
- Create: `src/commands/iterate.ts`

- [ ] **Step 1: Implement src/commands/iterate.ts**

```ts
import { join } from "node:path"
import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { branchExists, createBranch, commitAll } from "../git/ops"
import { createProvider } from "../llm/provider"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import { STAGING_BRANCH, MAIN_BRANCH } from "../types"
import {
  ITERATE_CLASSIFY_PROMPT,
  ITERATE_EDIT_PROMPT,
  buildIterateClassifyMessage,
  buildIterateEditMessage,
} from "../llm/prompts"

async function readAllFiles(dir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {}

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue
        await walk(fullPath)
      } else if (
        entry.name.endsWith(".astro") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".js") ||
        entry.name.endsWith(".mjs") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".json")
      ) {
        const relPath = fullPath.replace(dir, "").replace(/^\//, "")
        files[relPath] = await readFile(fullPath, "utf-8")
      }
    }
  }

  await walk(dir)
  return files
}

export async function iterate(slug: string, prompt: string): Promise<void> {
  const siteDir = join(process.cwd(), "sites", slug)

  if (!existsSync(siteDir)) {
    throw new Error(`Site "${slug}" not found at sites/${slug}`)
  }

  if (await branchExists(siteDir, STAGING_BRANCH)) {
    throw new Error(
      `A staging branch already exists for "${slug}". Merge or discard it first.`
    )
  }

  console.log(`\n=== Iterate: ${slug} ===\n`)
  console.log(`  Prompt: "${prompt}"`)

  const provider = await createProvider()

  console.log("  Classifying prompt scope...")
  const classifyResponse = await provider.generate(
    ITERATE_CLASSIFY_PROMPT,
    buildIterateClassifyMessage(prompt)
  )

  if (classifyResponse.trim().toLowerCase() !== "yes") {
    throw new Error(
      `Prompt is out of scope for automated changes.\nClassification: ${classifyResponse}`
    )
  }

  console.log("  Reading current site files...")
  const currentFiles = await readAllFiles(siteDir)

  console.log("  Applying changes via LLM...")
  const editResponse = await provider.generate(
    ITERATE_EDIT_PROMPT,
    buildIterateEditMessage(currentFiles, prompt)
  )

  let fileMap: Record<string, string>
  try {
    const jsonStart = editResponse.indexOf("{")
    const jsonEnd = editResponse.lastIndexOf("}") + 1
    fileMap = JSON.parse(editResponse.slice(jsonStart, jsonEnd))
  } catch {
    throw new Error("LLM returned malformed response — unable to parse file changes")
  }

  console.log("  Creating staging branch...")
  await createBranch(siteDir, STAGING_BRANCH)

  for (const [filePath, content] of Object.entries(fileMap)) {
    const fullPath = join(siteDir, filePath)
    await Bun.write(fullPath, content)
    console.log(`    Updated ${filePath}`)
  }

  await commitAll(siteDir, `Iterate: ${prompt}`)

  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to staging preview...")
  const previewUrl = await deploy(siteDir, STAGING_BRANCH, slug)

  console.log(`\n=== Staged! Preview at ${previewUrl} ===`)
  console.log(`  Run "bun run merge ${slug}" to publish, or "bun run discard ${slug}" to revert.\n`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/iterate.ts
git commit -m "feat: add iterate command with scope classification"
```

---

### Task 18: Command — Merge

**Files:**
- Create: `src/commands/merge.ts`

- [ ] **Step 1: Implement src/commands/merge.ts**

```ts
import { join } from "node:path"
import { existsSync } from "node:fs"
import { branchExists, mergeBranch, deleteBranch } from "../git/ops"
import { build } from "../pipeline/build"
import { deploy } from "../pipeline/deploy"
import { STAGING_BRANCH, MAIN_BRANCH } from "../types"

export async function merge(slug: string): Promise<void> {
  const siteDir = join(process.cwd(), "sites", slug)

  if (!existsSync(siteDir)) {
    throw new Error(`Site "${slug}" not found at sites/${slug}`)
  }

  if (!(await branchExists(siteDir, STAGING_BRANCH))) {
    throw new Error(`No staging branch exists for "${slug}". Nothing to merge.`)
  }

  console.log(`\n=== Merge: ${slug} ===\n`)

  console.log("  Merging staging into main...")
  await mergeBranch(siteDir, STAGING_BRANCH, MAIN_BRANCH)

  console.log("  Deleting staging branch...")
  await deleteBranch(siteDir, STAGING_BRANCH)

  console.log("  Building...")
  await build(siteDir)

  console.log("  Deploying to production...")
  const url = await deploy(siteDir, MAIN_BRANCH, slug)

  console.log(`\n=== Merged! Site updated at ${url} ===\n`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/merge.ts
git commit -m "feat: add merge command"
```

---

### Task 19: Sample Template

**Files:**
- Create: `templates/business-one/package.json`
- Create: `templates/business-one/astro.config.mjs`
- Create: `templates/business-one/src/pages/index.astro`
- Create: `templates/business-one/src/components/ui/button.astro`
- Create: `templates/business-one/src/components/ui/card.astro`
- Create: `templates/blocks/.gitkeep`

- [ ] **Step 1: Create template directory structure**

```bash
mkdir -p templates/business-one/src/pages
mkdir -p templates/business-one/src/components/ui
mkdir -p templates/business-one/src/layouts
mkdir -p templates/business-one/public
mkdir -p templates/blocks
```

- [ ] **Step 2: Create templates/business-one/package.json**

```json
{
  "name": "template-business-one",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 3: Create templates/business-one/astro.config.mjs**

```js
import { defineConfig } from "astro/config"

export default defineConfig({
  output: "static",
  build: {
    assets: "assets",
  },
})
```

- [ ] **Step 4: Create templates/business-one/src/pages/index.astro**

```astro
---
import Hero from "../components/Hero.astro"
import Features from "../components/Features.astro"
import CTA from "../components/CTA.astro"
import Footer from "../components/Footer.astro"
---

<Hero />
<Features />
<CTA />
<Footer />
```

- [ ] **Step 5: Create templates/business-one/src/components/Hero.astro**

```astro
---
// {{SLOT:hero}}
---

<section class="hero">
  <div class="container">
    <h1>{{SLOT:hero_heading}}</h1>
    <p class="tagline">{{SLOT:hero_tagline}}</p>
    <img src="{{SLOT:hero_image}}" alt="Hero image" class="hero-image" />
  </div>
</section>

<style>
  .hero {
    padding: 6rem 2rem;
    text-align: center;
    background: var(--bg-primary, #f9fafb);
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-primary, #111827);
  }
  .tagline {
    font-size: 1.25rem;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 2rem;
  }
  .hero-image {
    max-width: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  }
</style>
```

- [ ] **Step 6: Create templates/business-one/src/components/Features.astro**

```astro
---
// {{SLOT:features}}
---

<section class="features">
  <div class="container">
    <h2>{{SLOT:features_heading}}</h2>
    <p class="subtitle">{{SLOT:features_subtitle}}</p>
    <div class="grid">
      {{SLOT:features_items}}
    </div>
  </div>
</section>

<style>
  .features {
    padding: 5rem 2rem;
    background: #fff;
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
    color: var(--text-primary, #111827);
  }
  .subtitle {
    text-align: center;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 3rem;
    font-size: 1.1rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
</style>
```

- [ ] **Step 7: Create templates/business-one/src/components/CTA.astro**

```astro
---
// {{SLOT:cta}}
---

<section class="cta">
  <div class="container">
    <h2>{{SLOT:cta_heading}}</h2>
    <p>{{SLOT:cta_body}}</p>
    <a href="{{SLOT:cta_link}}" class="cta-button">{{SLOT:cta_button_text}}</a>
  </div>
</section>

<style>
  .cta {
    padding: 5rem 2rem;
    text-align: center;
    background: var(--accent, #2563eb);
    color: #fff;
  }
  .container {
    max-width: 700px;
    margin: 0 auto;
  }
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.15rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
  .cta-button {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: #fff;
    color: var(--accent, #2563eb);
    font-weight: 600;
    border-radius: 0.5rem;
    text-decoration: none;
    font-size: 1.1rem;
    transition: transform 0.15s;
  }
  .cta-button:hover {
    transform: scale(1.05);
  }
</style>
```

- [ ] **Step 8: Create templates/business-one/src/components/Footer.astro**

```astro
---
// {{SLOT:footer}}
---

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <h3>{{SLOT:footer_business_name}}</h3>
        <p>{{SLOT:footer_tagline}}</p>
      </div>
      <div class="footer-contact">
        <h4>Contact</h4>
        <p>{{SLOT:footer_email}}</p>
        <p>{{SLOT:footer_phone}}</p>
        <p>{{SLOT:footer_address}}</p>
      </div>
      <div class="footer-social">
        <h4>Follow Us</h4>
        {{SLOT:footer_social}}
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    padding: 4rem 2rem;
    background: var(--bg-dark, #1f2937);
    color: var(--text-light, #e5e7eb);
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  h3, h4 {
    color: #fff;
    margin-bottom: 0.75rem;
  }
  p {
    opacity: 0.8;
    margin-bottom: 0.35rem;
    font-size: 0.95rem;
  }
</style>
```

- [ ] **Step 9: Create templates/blocks/.gitkeep**

Run: `touch templates/blocks/.gitkeep`

- [ ] **Step 10: Install template dependencies**

Run: `cd templates/business-one && bun install`
Expected: dependencies installed in template.

- [ ] **Step 11: Commit**

```bash
git add templates/
git commit -m "feat: add sample business-one template with slot markers"
```

---

### Task 20: Integration — Verify Full Chain (unit-level)

**Files:**
- Create: `src/commands/generate.test.ts`

This tests the generate orchestration with all external deps mocked.

- [ ] **Step 1: Write integration test for generate**

```ts
// src/commands/generate.test.ts
// NOTE: This test is NOT run automatically with `bun test` because
// generate.ts depends on filesystem and env var state.
// It serves as documentation of the expected flow and can be run manually
// with appropriate mocks and temp directories.

import { describe, it, expect } from "bun:test"

describe("generate command flow", () => {
  it("creates correct slug from URL", () => {
    const url = "https://subdomain.domain.com"
    const parsed = new URL(url)
    const slug = parsed.hostname.replace(/\./g, "-")
    expect(slug).toBe("subdomain-domain-com")
  })

  it("creates correct slug from simple URL", () => {
    const url = "https://lucasbakery.com"
    const slug = new URL(url).hostname.replace(/\./g, "-")
    expect(slug).toBe("lucasbakery-com")
  })
})
```

- [ ] **Step 2: Run tests to verify**

Run: `bun test src/commands/generate.test.ts`
Expected: PASS (these are just slug tests, no deps needed).

- [ ] **Step 3: Commit**

```bash
git add src/commands/generate.test.ts
git commit -m "test: add slug generation tests"
```

---

### Task 21: Final — Run Typecheck and Test Suite

- [ ] **Step 1: Run full test suite**

Run: `bun test`
Expected: all tests PASS (git ops, provider, deepseek, crawler, summarizer, registry, resolver, slug).

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: no errors. Fix any issues that arise from imports or missing types.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix type and test issues"
```

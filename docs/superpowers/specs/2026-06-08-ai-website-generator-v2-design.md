# AI Website Generator — Revised Design Spec (v2)

> Supersedes the 2026-06-08 spec. Core change: templates are shadcn block manifests, not hand-written Astro projects.

## Overview

A monorepo-based tool that uses AI to create static websites for small businesses. Four CLI commands — `generate`, `iterate`, `merge`, `discard` — handle the full lifecycle. Templates are manifest files referencing shadcn blocks from the registry at https://ui.shadcn.com. The LLM fills content as structured JSON, not by editing source code.

## Architecture (unchanged)

```
src/cli.ts                 → Command parsing, routes to commands/
src/commands/              → CLI entry points that orchestrate workflows
src/pipeline/              → Build + deploy logic, shared by all commands
src/llm/                   → LLM abstraction (provider, DeepSeek adapter, prompts)
src/scraper/               → Website scraping, content extraction, token-efficient summarization
src/templates/             → Manifest discovery, site scaffolding, block installation, page building
src/git/                   → Git operations (init, branch, merge, branch delete, status)
```

## Directory Structure (revised)

```
biogenesis-3/
├── src/
│   ├── cli.ts
│   ├── types.ts                     # Added: BlockManifest, BlockFieldSchema, ContentPayload
│   ├── commands/
│   │   ├── generate.ts              # Modified: scrape-first flow, LLM outputs JSON not .astro
│   │   ├── iterate.ts               # Modified: reads/writes src/data/*.json, not .astro
│   │   ├── merge.ts                 # Unchanged
│   │   └── discard.ts               # Unchanged
│   ├── pipeline/
│   │   ├── build.ts                 # Unchanged
│   │   └── deploy.ts                # Unchanged
│   ├── llm/
│   │   ├── provider.ts              # Unchanged
│   │   ├── deepseek.ts              # Unchanged
│   │   └── prompts.ts               # Modified: generate prompt outputs JSON per manifest
│   ├── scraper/
│   │   ├── crawler.ts               # Unchanged
│   │   └── summarizer.ts            # Unchanged
│   ├── templates/
│   │   ├── registry.ts              # Rewrite: discovers manifest.json, type matching
│   │   ├── resolver.ts              # Rewrite: scaffolds Astro+React+Tailwind+shadcn
│   │   ├── block-installer.ts       # New: wraps shadcn add CLI
│   │   └── page-builder.ts          # New: generates index.astro + data files
│   └── git/
│       └── ops.ts                   # Unchanged
├── templates/                       # Only manifest.json files (no Astro projects)
│   └── business-one/
│       └── manifest.json
├── sites/                           # Gitignored entirely
│   └── .gitkeep
├── package.json
├── tsconfig.json
└── .env.example
```

## Template Manifest

A single JSON file per template. Defines block composition, field schemas with hints, optionality, and business type matching for auto-selection.

```json
{
  "name": "restaurant-one",
  "description": "Restaurants, cafes, bakeries, and food businesses",
  "types": ["restaurant", "cafe", "bakery", "food-truck", "bar"],
  "blocks": [
    {
      "name": "hero-01",
      "optional": false,
      "fields": {
        "heading": { "type": "string", "hint": "Main value prop, under 60 chars" },
        "tagline": { "type": "string", "hint": "Subtitle, under 80 chars" },
        "cta_label": { "type": "string", "hint": "Primary button text" },
        "cta_href": { "type": "string", "hint": "CTA destination URL" },
        "image_src": { "type": "string", "hint": "Hero image URL" }
      }
    },
    {
      "name": "menu-section-01",
      "optional": false,
      "fields": {
        "heading": { "type": "string" },
        "items": {
          "type": "array",
          "items": { "name": "string", "description": "string", "price": "string" }
        }
      }
    },
    {
      "name": "testimonial-01",
      "optional": true,
      "fields": {
        "heading": { "type": "string", "hint": "Section heading, e.g. 'What Our Customers Say'" },
        "items": {
          "type": "array",
          "items": { "quote": "string", "author": "string", "role": "string" }
        }
      }
    },
    {
      "name": "gallery-01",
      "optional": true,
      "fields": {
        "heading": { "type": "string" },
        "images": {
          "type": "array",
          "items": { "src": "string", "alt": "string" }
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

- `optional: true` — LLM may return `null` if the scraped data has no supporting content. Page builder skips null blocks.
- `optional: false` — always rendered. LLM must provide content.
- `types` — used for auto-selection when `--template` is not specified. A value of `"*"` makes it a generic fallback.
- Block order in the manifest is the render order on the page. Fixed during generate. Reordering is a future iterate capability.

## CLI Commands

### `generate <url> [--template <name>]`
1. URL parsed into slug: `https://subdomain.domain.com` → `subdomain-domain-com`
2. Scraper crawls source website (full mirror), summarizer converts to structured JSON
3. Template selection:
   - `--template <name>` → use that manifest
   - No flag → cheap LLM classify: `"What type of business?"` → match against manifest `types`. Pick random from matches, fallback to `"*"` wildcard
4. Resolver scaffolds site: `create astro` → add React → add Tailwind → `shadcn init`
5. Block installer: `shadcn add <block>` for each block in manifest
6. LLM receives manifest field schemas + structured business data → content JSON. Optional blocks can be `null`
7. Page builder writes `src/pages/index.astro` (composes non-null blocks in order, imports data) and `src/data/<block-name>.json` per block
8. Git init, commit
9. Pipeline build + deploy to production (main branch)

### `iterate <slug> <prompt>`
1. Branch check: fails if staging branch already exists
2. LLM classifies prompt scope (in-scope: text/content changes to existing blocks; out-of-scope: add/remove/reorder blocks, structural changes)
3. If out-of-scope: exit with message. If in-scope: LLM reads `src/data/*.json` files, applies changes
4. Git creates staging branch, commits
5. Pipeline build + deploy preview (staging branch → preview URL)

### `merge <slug>` (unchanged)
1. Fails if no staging branch
2. Git merge staging → main, delete staging
3. Build + deploy to production

### `discard <slug>` (unchanged)
1. Fails if no staging branch
2. Checkout main, delete staging branch. No build, no deploy.

**Branch constraint**: Each site has `main` (always) + zero or one `staging` branch.

### Generate LLM Prompt (revised)

The generate prompt now asks the LLM to output structured JSON matching the manifest's field schemas:

```json
{
  "hero-01": {
    "heading": "Lucas Bakery",
    "tagline": "Fresh Bread Daily",
    "cta_label": "View Our Menu",
    "cta_href": "#menu",
    "image_src": "/img/hero.jpg"
  },
  "menu-section-01": { ... },
  "testimonial-01": {
    "heading": "What Our Customers Say",
    "items": [
      { "quote": "Best bread in Portland!", "author": "Sarah M.", "role": "Regular Customer" }
    ]
  },
  "gallery-01": null,
  "footer-01": { ... }
}
```

### Business Type Classification Prompt

Very lightweight call — the LLM receives only business name, description, and section headings from the structured data, not the full crawl. Returns a single type word:

```
business_name: "Lucas Bakery"
description: "A bakery in Portland..."
sections: ["hero", "services", "contact"]

What type of business is this? Respond with ONE word.
→ "bakery"
```

### Iterate LLM Prompt (revised)

The iterate edit prompt now reads/writes `src/data/*.json` files instead of `.astro` source. Same two-call pattern: classify scope, then edit data. Iterate cannot add/remove blocks from the manifest — that is a generate-level operation.

## Scraper (unchanged)

Crawler extracts text, structure, images. Summarizer uses LLM to produce structured business data. No raw HTML in LLM context.

## Pipeline (unchanged)

Build: `cd sites/<slug> && bun install && bun run build`
Deploy: `bunx wrangler pages deploy` (main = production, staging = preview)

## LLM Abstraction (unchanged)

```ts
interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>
}
```

Factory selects from `LLM_PROVIDER` env var. DeepSeek adapter ships first. Retry once on network errors.

## Error Handling (unchanged)

- Branch state enforcement in git/ops.ts
- Build fails → surface stderr, don't deploy
- Deploy fails → surface wrangler error, leave git state
- LLM API fails → retry once, then error
- LLM malformed JSON → surface to user, don't save
- Classification unclear → default to out-of-scope (safe)
- Optional block scaffolding: blocks that resolve to null are still installed (they exist in the codebase), just not rendered. This avoids missing imports.

## Testing Strategy

**Unit tests:**
- `llm/provider.ts`, `llm/deepseek.ts` — unchanged
- `git/ops.ts` — unchanged
- `scraper/crawler.ts`, `scraper/summarizer.ts` — unchanged
- `templates/registry.ts` — test manifest discovery, type matching, wildcard fallback
- `templates/page-builder.ts` — test rendered output with null blocks, block ordering

**Integration tests:**
- `templates/resolver.ts` — verify scaffolded project structure
- `templates/block-installer.ts` — verify shadcn add command is called correctly

**Not tested:** actual `shadcn add` (side-effectful), actual `create astro` (side-effectful), actual LLM calls (mocked), actual Cloudflare Pages deploy (side-effectful).

# AI Website Generator — Design Spec

## Overview

A monorepo-based tool that uses AI to automatically create static websites for small businesses. Three CLI commands — `generate`, `iterate`, `merge` — handle the full lifecycle from scraping an existing site to deploying on Cloudflare Pages. Tech stack: Astro, Bun, shadcn/ui, Wrangler/Cloudflare Pages, DeepSeek (LLM-agnostic).

## Architecture

Layered pipeline with clear boundaries (Approach 2):

```
src/cli.ts                 → Command parsing, routes to commands/
src/commands/              → CLI entry points that orchestrate workflows
src/pipeline/              → Build + deploy logic, shared by all commands
src/llm/                   → LLM abstraction (provider interface, DeepSeek adapter, prompts)
src/scraper/               → Website scraping, content extraction, token-efficient summarization
src/templates/             → Template library + block registry
src/git/                   → Git operations (init, branch, merge, branch delete, status)
```

Monorepo approach: simple directory convention (not workspaces, not Turborepo). Sites live in `sites/<slug>/`, gitignored entirely by the parent repo. Each site is its own self-contained git repo. Core tooling is versioned in the parent.

## Directory Structure

```
biogenesis-3/
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   ├── generate.ts
│   │   ├── iterate.ts
│   │   └── merge.ts
│   ├── pipeline/
│   │   ├── build.ts
│   │   └── deploy.ts
│   ├── llm/
│   │   ├── provider.ts          # LLMProvider interface + factory
│   │   ├── deepseek.ts          # DeepSeek adapter
│   │   └── prompts.ts           # Prompt templates
│   ├── scraper/
│   │   ├── crawler.ts           # Recursive page crawl
│   │   └── summarizer.ts        # Structured JSON from raw crawl
│   ├── templates/
│   │   ├── registry.ts          # Template discovery + random pick
│   │   └── resolver.ts          # Copy template, list placeholder slots
│   └── git/
│       └── ops.ts               # init, branch create, merge, branch delete, status
├── templates/                   # Template source files (each is a mini Astro project)
│   ├── business-one/
│   │   ├── src/pages/index.astro
│   │   ├── src/components/ui/   # Self-contained shadcn primitives
│   │   ├── astro.config.mjs
│   │   └── package.json
│   └── blocks/                  # Individual shadcn block .astro files
│       ├── hero-simple.astro
│       ├── features-grid.astro
│       └── cta-banner.astro
├── sites/                       # Gitignored entirely (parent .gitignore ignores sites/)
│   └── .gitkeep
├── .gitignore                   # Ignores node_modules, .env, sites/, dist/
├── package.json
├── tsconfig.json
└── .env.example
```

## Templates

Templates are self-contained mini Astro projects. Each carries its own `src/components/ui/` with the shadcn primitives it needs. No shared component store — duplication is acceptable given few templates.

Hybrid approach: templates provide layout/structure, LLM fills placeholder slots. The LLM can also swap individual blocks from `templates/blocks/` if scraped data warrants it.

Template files use slot markers like `{{SLOT:hero}}`, `{{SLOT:features}}`, `{{SLOT:cta}}` which the LLM replaces with scraped content.

## CLI Commands

### `generate <url> [template]`
1. URL parsed into slug: `https://subdomain.domain.com` → `subdomain-domain-com`
2. Scraper crawls the source website (full mirror), summarizer converts to structured JSON
3. Registry picks a template (specified or random)
4. Resolver copies template to `sites/<slug>/`
5. LLM receives system prompt + structured scrape + slot list, returns filled `.astro` files
6. Git inits repo, commits
7. Pipeline builds (`bun install && bun run build`) then deploys to Cloudflare Pages (prod, main branch)

### `iterate <slug> <prompt>`
1. Branch check: fails if staging branch already exists (max 1 staging branch at a time)
2. LLM classifies prompt as in-scope or out-of-scope (cheap classification call)
3. If out-of-scope: exit with message. If in-scope: LLM reads current site files, applies change
4. Git creates staging branch, commits
5. Pipeline builds and deploys to Cloudflare Pages preview (staging branch → preview URL)

### `merge <slug>`
1. Branch check: fails if no staging branch exists
2. Git merges staging → main, deletes staging branch
3. Pipeline builds and deploys to production (main branch)

**Branch constraint**: Each site has 1-2 branches: `main` (always) and zero or one `staging` branch. No parallel staging branches.

## LLM Abstraction

Interface:
```ts
interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>
}
```

Single method. Factory pattern selects provider from `LLM_PROVIDER` env var. DeepSeek adapter ships first. Easy to add OpenAI, Anthropic, local models later.

For `iterate`: LLM is called twice — classify (cheap, ~1 token threshold) then execute (full edit). Classification filters out prompts like "add user login" or "build a database" before wasting tokens.

## Scraper

Crawler: recursive page crawl, extracts text, structure, and image references. Summarizer converts raw crawl to compact structured JSON:

```json
{
  "business_name": "Lucas Bakery",
  "tagline": "...",
  "sections": [
    { "type": "hero", "heading": "...", "body": "...", "image_url": "..." },
    { "type": "features", "items": [...] }
  ],
  "contact": { "email": "...", "phone": "...", "address": "..." },
  "color_hints": ["#8B4513", "#FFF8DC"]
}
```

No raw HTML in LLM context — token-efficient structured data only.

## Pipeline

Build (`pipeline/build.ts`):
- Runs `cd sites/<slug> && bun install && bun run build`
- Assumes each template has standard Astro build scripts

Deploy (`pipeline/deploy.ts`):
- Runs `wrangler pages deploy` from the site's build output directory
- Supports production deploy (main branch) and preview deploy (staging branch)
- Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in env

Pipeline is always called automatically by `generate`/`iterate`/`merge` — never invoked manually.

## Error Handling

**Branch state enforcement** (git/ops.ts):
- `iterate`: fails if staging branch already exists
- `merge`: fails if no staging branch exists
- `generate`: fails if site already exists

**Pipeline errors**:
- Build fails → surface stderr, don't attempt deploy
- Deploy fails → surface wrangler error, leave git state intact (don't merge on failure)
- Branch management is not transactional on deploy failure — merge commits stay, just report error

**LLM errors**:
- API call fails → retry once, then surface error
- Malformed output (invalid .astro) → surface to user, don't save corrupted files
- Classification unclear → default to out-of-scope (safe)

**Secrets**: `.env` file at root, never committed. Required: `LLM_API_KEY`, `LLM_PROVIDER=deepseek`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Testing Strategy

**Unit tests** (`bun test`):
- `llm/provider.ts` — mock adapter, verify prompt construction
- `git/ops.ts` — test branch create/merge/delete with temp repos
- `scraper/summarizer.ts` — verify structured output from known crawl data
- `templates/registry.ts` — verify random pick and explicit pick

**Integration tests**:
- `generate` with mock scrape + known template, verify output .astro matches expected replacements
- `pipeline/build.ts` — build a known-good site, verify no errors

**Not tested**: actual LLM calls (mocked), actual Cloudflare Pages deploy (side-effectful), actual network scraping (fragile).

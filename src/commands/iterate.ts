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

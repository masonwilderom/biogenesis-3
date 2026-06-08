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

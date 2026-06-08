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

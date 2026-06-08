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
  const curr = await currentBranch(dir)
  if (curr === branch) {
    await git(dir, ["checkout", "main"])
  }
  await git(dir, ["branch", "-D", branch])
}

export async function checkout(dir: string, branch: string): Promise<void> {
  if (!(await branchExists(dir, branch))) {
    throw new Error(`Branch "${branch}" not found`)
  }
  await git(dir, ["checkout", branch])
}

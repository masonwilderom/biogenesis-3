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
    expect(existsSync(join(dir, "f.txt"))).toBe(true)
  })
})

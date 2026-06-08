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

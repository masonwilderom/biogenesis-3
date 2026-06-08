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

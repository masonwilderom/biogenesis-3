// scripts/fetch-tailark-blocks.ts
// Fetches all @tailark blocks and saves them to templates/blocks/tailark/
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const BLOCKS_DIR = "templates/blocks/tailark"
const REGISTRY_BASE = "https://tailark.com/r"

const BLOCK_NAMES = [
  "call-to-action-1", "call-to-action-2", "call-to-action-3",
  "comparator-1",
  "content-1", "content-2", "content-3", "content-4", "content-5", "content-6", "content-7",
  "faqs-1", "faqs-2", "faqs-3", "faqs-4",
  "features-1", "features-2", "features-3", "features-4", "features-5", "features-6",
  "features-7", "features-8", "features-9", "features-10", "features-11", "features-12",
  "footer-1", "footer-2", "footer-3", "footer-4", "footer-5",
  "hero-section-1", "hero-section-2", "hero-section-3", "hero-section-4", "hero-section-5",
  "hero-section-6", "hero-section-7", "hero-section-8", "hero-section-9",
  "login-1", "login-2", "login-3",
  "sign-up-1", "sign-up-2", "sign-up-3",
  "forgot-password-1", "forgot-password-2",
  "stats-1", "stats-2", "stats-3", "stats-4",
  "team-1", "team-2",
  "testimonials-1", "testimonials-2", "testimonials-3", "testimonials-4", "testimonials-5", "testimonials-6",
  "logo-cloud-1", "logo-cloud-2", "logo-cloud-3",
  "pricing-1", "pricing-2", "pricing-3", "pricing-4", "pricing-5",
  "contact-1", "contact-2",
  "integrations-1", "integrations-2", "integrations-3", "integrations-4", "integrations-5", "integrations-6", "integrations-7", "integrations-8",
  "mist-call-to-action-1", "mist-call-to-action-2", "mist-call-to-action-3",
  "mist-comparator-1", "mist-contact-1",
  "mist-content-1", "mist-content-2", "mist-content-3", "mist-content-4",
  "mist-faqs-1", "mist-faqs-2", "mist-faqs-3",
  "mist-features-1", "mist-features-2", "mist-features-3", "mist-features-4", "mist-features-5", "mist-features-6", "mist-features-7", "mist-features-8",
]

// Remove duplicates
const UNIQUE_BLOCKS = [...new Set(BLOCK_NAMES)]

async function fetchBlock(name: string): Promise<boolean> {
  const url = `${REGISTRY_BASE}/${name}.json`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) return false
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json() as {
      name: string
      type: string
      title?: string
      description?: string
      dependencies?: string[]
      registryDependencies?: string[]
      files?: { target?: string; content?: string; type?: string }[]
    }

    const blockDir = join(BLOCKS_DIR, name)
    await mkdir(blockDir, { recursive: true })

    // Save each file
    if (data.files) {
      for (const file of data.files) {
        if (file.target && file.content) {
          const filePath = join(blockDir, file.target)
          await mkdir(join(filePath, ".."), { recursive: true })
          await Bun.write(filePath, file.content)
        }
      }
    }

    // Save metadata
    const meta = {
      name: data.name,
      type: data.type,
      title: data.title,
      description: data.description,
      dependencies: data.dependencies || [],
      registryDependencies: data.registryDependencies || [],
    }
    await Bun.write(join(blockDir, "meta.json"), JSON.stringify(meta, null, 2))

    return true
  } catch (err) {
    console.warn(`  [error] ${name}: ${(err as Error).message}`)
    return false
  }
}

async function main() {
  await mkdir(BLOCKS_DIR, { recursive: true })
  console.log(`Fetching ${UNIQUE_BLOCKS.length} blocks...`)

  let succeeded = 0
  for (const name of UNIQUE_BLOCKS) {
    process.stdout.write(`  ${name}... `)
    const ok = await fetchBlock(name)
    if (ok) {
      console.log("OK")
      succeeded++
    } else {
      console.log("SKIPPED")
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nDone. ${succeeded}/${UNIQUE_BLOCKS.length} blocks saved to ${BLOCKS_DIR}`)
}

main()

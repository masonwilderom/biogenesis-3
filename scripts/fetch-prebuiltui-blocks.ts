// scripts/fetch-prebuiltui-blocks.ts
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const BLOCKS_DIR = "templates/blocks/prebuiltui"
const REGISTRY_BASE = "https://21st.dev/r/prebuiltui"

// Marketing-relevant blocks
const BLOCK_NAMES = [
  "hero-section",
  "feature-sections",
  "call-to-action-1",
  "testimonial",
  "footer-1",
  "about",
  "banner-ui",
  "faq-sections",
  "image-gallery",
  "pricing-cards",
  "cards",
]

async function fetchBlock(name: string): Promise<boolean> {
  const url = `${REGISTRY_BASE}/${name}`
  
  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    })
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
      files?: { target?: string; content?: string; type?: string; path?: string }[]
    }

    const blockDir = join(BLOCKS_DIR, name)
    await mkdir(blockDir, { recursive: true })

    // Save each file
    if (data.files) {
      for (const file of data.files) {
        const target = file.target || file.path
        if (target && file.content) {
          const filePath = join(blockDir, target)
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
  console.log(`Fetching ${BLOCK_NAMES.length} blocks from prebuiltui...`)

  let succeeded = 0
  for (const name of BLOCK_NAMES) {
    process.stdout.write(`  ${name}... `)
    const ok = await fetchBlock(name)
    if (ok) {
      console.log("OK")
      succeeded++
    } else {
      console.log("SKIPPED")
    }
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nDone. ${succeeded}/${BLOCK_NAMES.length} blocks saved to ${BLOCKS_DIR}`)
}

main()

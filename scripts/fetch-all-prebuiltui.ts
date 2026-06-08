// scripts/fetch-all-prebuiltui.ts
// Fetches all prebuiltui community pages and extracts component code
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { join } from "node:path"

const URLS_FILE = "/tmp/prebuiltui-urls.txt"
const BLOCKS_DIR = "templates/blocks/prebuiltui"

interface VariantInfo {
  url: string
  category: string
  variant: string | null
}

function parseUrl(url: string): VariantInfo {
  const path = url.replace("https://21st.dev/community/components/prebuiltui/", "")
  const parts = path.split("/")
  if (parts.length === 2) {
    return { url, category: parts[0], variant: parts[1] }
  }
  return { url, category: parts[0], variant: null }
}

function extractCode(html: string): string | null {
  // Strip HTML tags and script tags
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")

  // HTML decode
  const decoded = stripped
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x3C;/g, "<")
    .replace(/&#x3E;/g, ">")
    .replace(/&#x26;/g, "&")
    .replace(/&#x2F;/g, "/")

  // Find code block starting with "use client" or "import" or "export"
  const patterns = ['"use client"', "'use client'", "import React", "export default function"]
  
  let startIdx = -1
  for (const pattern of patterns) {
    const idx = decoded.indexOf(pattern)
    if (idx >= 0 && (startIdx < 0 || idx < startIdx)) {
      startIdx = idx
    }
  }
  
  if (startIdx < 0) return null

  const chunk = decoded.slice(startIdx)
  
  // End markers (appear after the code)
  const endMarkers = ["Websiteprebuiltui.com", "Website", "Created ", "TagsScroll", "prebuiltui.com/component"]
  let endIdx = chunk.length
  for (const marker of endMarkers) {
    const idx = chunk.indexOf(marker)
    if (idx > 0 && idx < endIdx) endIdx = idx
  }

  let code = chunk.slice(0, endIdx).trim()
  
  // Clean up trailing artifacts
  code = code.replace(/\s*$/, "")
  
  if (code.length < 20) return null
  return code
}

async function main() {
  const urlText = await readFile(URLS_FILE, "utf-8")
  const urls = urlText.trim().split("\n").filter(u => u.trim())
  
  console.log(`Processing ${urls.length} URLs...`)
  
  let fetched = 0
  let skipped = 0
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim()
    const info = parseUrl(url)
    const label = info.variant ? `${info.category}/${info.variant}` : info.category
    
    process.stdout.write(`  [${i + 1}/${urls.length}] ${label}... `)
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.log("HTTP", response.status)
        skipped++
        continue
      }
      
      const html = await response.text()
      const code = extractCode(html)
      
      if (code) {
        const dir = join(BLOCKS_DIR, info.category)
        await mkdir(dir, { recursive: true })
        const filename = info.variant ? `${info.variant}.tsx` : `${info.category}.tsx`
        await writeFile(join(dir, filename), code)
        console.log("OK")
        fetched++
      } else {
        console.log("NO CODE")
        skipped++
      }
    } catch (err) {
      console.log("ERROR:", (err as Error).message)
      skipped++
    }
    
    // Rate limit
    if (i % 10 === 9) {
      await new Promise(r => setTimeout(r, 1000))
    } else {
      await new Promise(r => setTimeout(r, 200))
    }
  }
  
  console.log(`\nDone. Fetched: ${fetched}, Skipped: ${skipped}/${urls.length}`)
}

main()

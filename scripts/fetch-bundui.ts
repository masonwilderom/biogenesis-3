// scripts/fetch-bundui.ts
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const BLOCKS_DIR = "templates/blocks/bundui"
const REGISTRY_URL = "https://bundui.io/r/{name}.json"

const NAMES = [
  "accordion-collapsible", "accordion-default", "accordion-with-plus-icon",
  "alert-danger", "alert-default", "alert-dialog", "alert-success", "alert-warning",
  "alert-with-action-button", "alert-with-dismiss", "alert-with-icon", "alert-with-title",
  "avatar-avatar-group", "avatar-default", "avatar-fallback-only", "avatar-sizes",
  "avatar-with-status-indicator", "badge-default", "badge-destructive", "badge-indicator",
  "badge-outline", "badge-secondary", "badge-with-dismiss", "badge-with-icon",
  "breadcrumb-default", "breadcrumb-with-dropdown", "breadcrumb-with-icon",
  "button-default", "button-destructive", "button-disabled", "button-ghost",
  "button-icon-sizes", "button-link", "button-loading", "button-loading-with-icon",
  "button-only-icon", "button-outline", "button-secondary", "button-sizes", "button-with-icon",
  "calendar", "card-colored", "card-default", "card-with-action", "card-with-footer",
  "card-with-header", "card-with-header-description", "card-with-header-icon",
  "carousel-01", "carousel-02", "carousel-03", "chart", "checkbox", "collapsible",
  "combobox", "command", "context-menu",
  "cta-sections-01", "cta-sections-02", "cta-sections-03", "cta-sections-04",
  "data-table-01", "data-table-02", "data-table-03", "date-picker", "dialog",
  "divider-01", "divider-02", "divider-03", "drawer", "dropdown-menu",
  "hero-sections-01", "hero-sections-02", "hero-sections-03", "hero-sections-04", "hero-sections-05",
  "hover-card", "input", "input-otp", "menubar", "navigation-menu", "pagination",
  "popover", "pricing-sections-01", "pricing-sections-02", "progress",
  "radio-group", "select-01", "select-02", "select-03", "select-04", "select-05",
  "sheet", "sidebar", "skeleton", "slider", "switch", "tabs", "toggle-group", "tooltip",
]

async function main() {
  await mkdir(BLOCKS_DIR, { recursive: true })
  
  let success = 0
  let fail = 0
  
  for (const name of NAMES) {
    process.stdout.write(`  ${name}... `)
    const url = REGISTRY_URL.replace("{name}", name)
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.log(`HTTP ${response.status}`)
        fail++
        continue
      }
      
      const data = await response.json() as any
      const blockDir = join(BLOCKS_DIR, name)
      await mkdir(blockDir, { recursive: true })
      
      // Save registry JSON
      await writeFile(join(blockDir, "registry.json"), JSON.stringify(data, null, 2))
      
      // Save each file
      if (data.files) {
        for (const file of data.files) {
          if (file.target && file.content) {
            const filePath = join(blockDir, file.target)
            await mkdir(join(filePath, ".."), { recursive: true })
            await writeFile(filePath, file.content)
          }
        }
      }
      
      const fileCount = data.files?.length || 0
      console.log(`OK (${fileCount} files)`)
      success++
    } catch (err) {
      console.log(`ERROR: ${(err as Error).message}`)
      fail++
    }
    
    await new Promise(r => setTimeout(r, 150))
  }
  
  console.log(`\nDone. ${success} fetched, ${fail} failed.`)
}

main()

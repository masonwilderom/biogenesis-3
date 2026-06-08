import * as cheerio from "cheerio"
import type { CrawlPage, CrawlResult } from "../types"

function extractDomain(url: string): string {
  return new URL(url).hostname
}

function resolveUrl(base: string, path: string): string | null {
  try {
    return new URL(path, base).href
  } catch {
    return null
  }
}

async function crawlPage(url: string): Promise<CrawlPage> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`)
  }
  const html = await response.text()
  const $ = cheerio.load(html)

  const headings: { level: number; text: string }[] = []
  for (let i = 1; i <= 6; i++) {
    $(`h${i}`).each((_, el) => {
      const text = $(el).text().trim()
      if (text) headings.push({ level: i, text })
    })
  }

  const paragraphs: string[] = []
  $("p").each((_, el) => {
    const text = $(el).text().trim()
    if (text) paragraphs.push(text)
  })

  const links: string[] = []
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")
    if (href) links.push(href)
  })

  const images: string[] = []
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src")
    if (src) images.push(src)
  })

  return {
    url,
    title: $("title").first().text().trim() || url,
    headings,
    paragraphs,
    links,
    images,
  }
}

export async function crawl(startUrl: string, maxPages = 50): Promise<CrawlResult> {
  const domain = extractDomain(startUrl)
  const visited = new Set<string>()
  const pages: CrawlPage[] = []
  const queue: string[] = [startUrl]

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    const normalized = url.split("#")[0]

    if (visited.has(normalized)) continue
    visited.add(normalized)

    if (extractDomain(normalized) !== domain) continue

    try {
      const page = await crawlPage(normalized)
      pages.push(page)

      for (const link of page.links) {
        const resolved = resolveUrl(normalized, link)
        if (resolved && !visited.has(resolved.split("#")[0]) && extractDomain(resolved) === domain) {
          queue.push(resolved)
        }
      }
    } catch (err) {
      console.warn(`  [warn] Could not crawl ${normalized}: ${(err as Error).message}`)
    }
  }

  if (pages.length === 0) {
    throw new Error("Failed to crawl: no pages could be fetched")
  }

  return { pages }
}

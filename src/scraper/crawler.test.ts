import { describe, it, expect, mock, afterEach } from "bun:test"
import type { CrawlResult } from "../types"
import { crawl } from "./crawler"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

function mockPage(title: string, body: string, links: string[] = []) {
  const linkTags = links.map((l) => `<a href="${l}">link</a>`).join("\n")
  return `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p>${linkTags}<img src="/img/logo.png" alt="logo"></body></html>`
}

describe("crawler", () => {
  it("crawls a single page and extracts content", async () => {
    globalThis.fetch = mock(async (url: string) => {
      return new Response(mockPage("Test Page", "Hello world"), { status: 200 })
    }) as unknown as typeof fetch

    const result: CrawlResult = await crawl("https://example.com")
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].title).toBe("Test Page")
    expect(result.pages[0].paragraphs).toContain("Hello world")
    expect(result.pages[0].headings).toEqual([{ level: 1, text: "Test Page" }])
    expect(result.pages[0].images).toContain("/img/logo.png")
  })

  it("follows same-domain links and crawls multiple pages", async () => {
    const pages: Record<string, string> = {
      "https://example.com": mockPage("Home", "Welcome", ["/about"]),
      "https://example.com/about": mockPage("About", "About us", []),
    }

    globalThis.fetch = mock(async (url: string) => {
      const content = pages[url]
      if (!content) return new Response("Not found", { status: 404 })
      return new Response(content, { status: 200 })
    }) as unknown as typeof fetch

    const result = await crawl("https://example.com")
    expect(result.pages).toHaveLength(2)
    const titles = result.pages.map((p) => p.title).sort()
    expect(titles).toEqual(["About", "Home"])
  })

  it("does not follow external links", async () => {
    const pages: Record<string, string> = {
      "https://example.com": mockPage("Home", "Welcome", [
        "https://other.com/page",
      ]),
    }

    globalThis.fetch = mock(async (url: string) => {
      const content = pages[url]
      if (content) return new Response(content, { status: 200 })
      throw new Error("Should not fetch external URL: " + url)
    }) as unknown as typeof fetch

    const result = await crawl("https://example.com")
    expect(result.pages).toHaveLength(1)
  })

  it("handles fetch errors gracefully", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("Network error")
    }) as unknown as typeof fetch

    await expect(crawl("https://example.com")).rejects.toThrow(
      "Failed to crawl"
    )
  })
})

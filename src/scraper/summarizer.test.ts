import { describe, it, expect } from "bun:test"
import { summarize } from "./summarizer"
import type { LLMProvider } from "../llm/provider"
import type { CrawlResult, StructuredData } from "../types"

const mockCrawl: CrawlResult = {
  pages: [
    {
      url: "https://example.com",
      title: "Lucas Bakery | Fresh Bread Daily",
      headings: [
        { level: 1, text: "Lucas Bakery" },
        { level: 2, text: "Fresh Bread Daily" },
        { level: 2, text: "Our Products" },
      ],
      paragraphs: [
        "We bake fresh bread every morning.",
        "Sourdough, baguettes, and pastries.",
        "123 Main St, Portland OR. Call us at 555-0123.",
      ],
      links: [],
      images: ["/img/hero.jpg"],
    },
  ],
}

const mockStructured: StructuredData = {
  business_name: "Lucas Bakery",
  tagline: "Fresh Bread Daily",
  description: "A bakery in Portland baking fresh bread every morning.",
  sections: [
    {
      type: "hero",
      heading: "Lucas Bakery",
      body: "Fresh Bread Daily",
      image_url: "/img/hero.jpg",
    },
    {
      type: "services",
      heading: "Our Products",
      body: "Sourdough, baguettes, and pastries.",
      items: [
        { title: "Sourdough", description: "Fresh daily sourdough" },
        { title: "Baguettes", description: "Traditional French baguettes" },
        { title: "Pastries", description: "Fresh baked pastries" },
      ],
    },
  ],
  contact: {
    phone: "555-0123",
    address: "123 Main St, Portland OR",
  },
  color_hints: ["#8B4513", "#FFF8DC"],
  social_links: [],
}

const mockProvider: LLMProvider = {
  generate: async () => JSON.stringify(mockStructured),
}

describe("summarizer", () => {
  it("extracts structured data from crawl result", async () => {
    const result = await summarize(mockCrawl, mockProvider)
    expect(result).toEqual(mockStructured)
  })

  it("throws if LLM returns invalid JSON", async () => {
    const badProvider: LLMProvider = {
      generate: async () => "not json at all",
    }
    await expect(summarize(mockCrawl, badProvider)).rejects.toThrow(
      "Failed to parse summarized data"
    )
  })
})

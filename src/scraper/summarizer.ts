import type { LLMProvider } from "../llm/provider"
import type { CrawlResult, StructuredData } from "../types"
import { SUMMARIZE_PROMPT } from "../llm/prompts"

export async function summarize(
  crawl: CrawlResult,
  provider: LLMProvider
): Promise<StructuredData> {
  const rawText = crawl.pages
    .map((p) => {
      const parts: string[] = []
      parts.push(`# Page: ${p.url}`)
      parts.push(`Title: ${p.title}`)
      for (const h of p.headings) {
        parts.push(`${"#".repeat(h.level)} ${h.text}`)
      }
      for (const para of p.paragraphs) {
        parts.push(para)
      }
      if (p.images.length > 0) {
        parts.push(`Images: ${p.images.join(", ")}`)
      }
      return parts.join("\n\n")
    })
    .join("\n---\n\n")

  const response = await provider.generate(SUMMARIZE_PROMPT, rawText)

  try {
    let json = response
    const mdMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (mdMatch) {
      json = mdMatch[1].trim()
    }
    const jsonStart = json.indexOf("{")
    const jsonEnd = json.lastIndexOf("}") + 1
    return JSON.parse(json.slice(jsonStart, jsonEnd)) as StructuredData
  } catch {
    throw new Error("Failed to parse summarized data from LLM response")
  }
}

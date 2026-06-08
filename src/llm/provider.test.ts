import { describe, it, expect } from "bun:test"
import type { LLMProvider } from "./provider"

const mockProvider: LLMProvider = {
  generate: async (systemPrompt: string, userMessage: string) => {
    return JSON.stringify({ received: { systemPrompt, userMessage } })
  },
}

describe("LLMProvider interface", () => {
  it("implements generate method", async () => {
    const result = await mockProvider.generate("sys", "usr")
    const parsed = JSON.parse(result)
    expect(parsed.received.systemPrompt).toBe("sys")
    expect(parsed.received.userMessage).toBe("usr")
  })
})

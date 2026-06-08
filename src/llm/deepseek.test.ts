import { describe, it, expect, mock, afterEach } from "bun:test"
import { createDeepSeekProvider } from "./deepseek"
import type { LLMProvider } from "./provider"

const originalFetch = globalThis.fetch
const originalEnv = { ...process.env }

afterEach(() => {
  globalThis.fetch = originalFetch
  process.env = { ...originalEnv }
})

describe("createDeepSeekProvider", () => {
  it("returns an LLMProvider with generate method", () => {
    process.env.LLM_API_KEY = "sk-test"
    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    expect(provider).toBeDefined()
    expect(typeof provider.generate).toBe("function")
  })

  it("calls DeepSeek API with correct parameters", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      expect(body.model).toBe("deepseek-chat")
      expect(body.messages[0].role).toBe("system")
      expect(body.messages[0].content).toBe("sys prompt")
      expect(body.messages[1].role).toBe("user")
      expect(body.messages[1].content).toBe("user msg")

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "hello from deepseek" } }],
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    const result = await provider.generate("sys prompt", "user msg")
    expect(result).toBe("hello from deepseek")
  })

  it("throws on API error", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ error: { message: "Invalid API key" } }),
        { status: 401 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    await expect(provider.generate("sys", "usr")).rejects.toThrow("DeepSeek API error")
  })

  it("throws on empty response", async () => {
    process.env.LLM_API_KEY = "sk-test"

    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ choices: [] }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    await expect(provider.generate("sys", "usr")).rejects.toThrow("no content in response")
  })

  it("retries once on fetch failure", async () => {
    process.env.LLM_API_KEY = "sk-test"

    let calls = 0
    globalThis.fetch = mock(async () => {
      calls++
      if (calls === 1) throw new Error("Network error")
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "retry success" } }],
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const provider = createDeepSeekProvider("sk-test", "deepseek-chat")
    const result = await provider.generate("sys", "usr")
    expect(result).toBe("retry success")
    expect(calls).toBe(2)
  })
})

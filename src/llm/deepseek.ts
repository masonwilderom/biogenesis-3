import type { LLMProvider } from "./provider"

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

async function fetchWithRetry(url: string, opts: RequestInit, retries = 1): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, opts)
      if (response.ok || attempt === retries) return response
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw new Error("DeepSeek API: all retries exhausted")
}

export function createDeepSeekProvider(apiKey: string, model: string): LLMProvider {
  return {
    async generate(systemPrompt: string, userMessage: string): Promise<string> {
      const response = await fetchWithRetry(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`DeepSeek API error (${response.status}): ${err}`)
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[]
      }

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error("DeepSeek API returned no content in response")
      }

      return content
    },
  }
}

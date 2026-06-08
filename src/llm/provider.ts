import { createDeepSeekProvider } from "./deepseek"

export interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>
}

export function getProviderConfig() {
  const provider = process.env.LLM_PROVIDER || "deepseek"
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || "deepseek-chat"

  if (!apiKey) {
    throw new Error("LLM_API_KEY environment variable is required")
  }

  return { provider, apiKey, model }
}

export async function createProvider(): Promise<LLMProvider> {
  const config = getProviderConfig()

  switch (config.provider) {
    case "deepseek":
      return createDeepSeekProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`)
  }
}

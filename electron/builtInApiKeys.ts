import type { ApiProvider } from "../shared/aiConfig"

// Add the provider keys you want to ship here.
// Leave providers you do not use as empty strings.
export const BUILT_IN_API_KEYS: Record<ApiProvider, string> = {
  openai: "",
  gemini: "",
  anthropic: "",
  together: "tgp_v1_DKrAI03e9T8MqQ4CzQpL99VJsZje4eq7dMGoe0sDKDU"
}

// Keys in .env (gitignored, bundled into packaged builds) take precedence, so
// secrets don't have to be committed to this file.
const API_KEY_ENV_VARS: Record<ApiProvider, string> = {
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  together: "TOGETHER_API_KEY",
}

export function getBuiltInApiKey(provider: ApiProvider): string {
  const envKey = process.env[API_KEY_ENV_VARS[provider]]?.trim()
  return envKey || BUILT_IN_API_KEYS[provider].trim()
}

// Here are the list of verified models and providers that we know work well with OpenHands.
export const VERIFIED_PROVIDERS = ["openai"];
export const VERIFIED_MODELS = ["o4-mini-2025-04-16"];

// LiteLLM does not return OpenAI models with the provider, so we list them here to set them ourselves for consistency
// (e.g., they return `gpt-4o` instead of `openai/gpt-4o`)
export const VERIFIED_OPENAI_MODELS = [
  "o4-mini",
  "o4-mini-2025-04-16",
];

// LiteLLM does not return the compatible Anthropic models with the provider, so we list them here to set them ourselves
// (e.g., they return `claude-3-5-sonnet-20241022` instead of `anthropic/claude-3-5-sonnet-20241022`)
export const VERIFIED_ANTHROPIC_MODELS = [
  "claude-2",
  "claude-2.1",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-7-sonnet-20250219",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
];

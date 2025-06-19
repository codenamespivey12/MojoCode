import { Settings } from "#/types/settings";

export const LATEST_SETTINGS_VERSION = 5;

export const DEFAULT_SETTINGS: Settings = {
  LLM_MODEL: "openai/o4-mini-2025-04-16",
  LLM_BASE_URL: "",
  AGENT: "CodeActAgent",
  LANGUAGE: "en",
  LLM_API_KEY_SET: true,
  SEARCH_API_KEY_SET: true,
  CONFIRMATION_MODE: false,
  SECURITY_ANALYZER: "",
  REMOTE_RUNTIME_RESOURCE_FACTOR: 1,
  PROVIDER_TOKENS_SET: {
    github: null,
  },
  ENABLE_DEFAULT_CONDENSER: true,
  ENABLE_SOUND_NOTIFICATIONS: false,
  USER_CONSENTS_TO_ANALYTICS: false,
  ENABLE_PROACTIVE_CONVERSATION_STARTERS: false,
  SEARCH_API_KEY: "",
  IS_NEW_USER: true,
  EMAIL: "",
  EMAIL_VERIFIED: true, // Default to true to avoid restricting access unnecessarily
  MCP_CONFIG: {
    sse_servers: [],
    stdio_servers: [],
  },
};

/**
 * Get the default settings
 */
export const getDefaultSettings = (): Settings => DEFAULT_SETTINGS;

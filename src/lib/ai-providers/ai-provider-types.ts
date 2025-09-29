/**
 * AI provider types and interface for dependency injection
 * This file defines a concise contract that all AI engine adapters must implement.
 *
 * Renamed from `types.ts` to `ai-provider-types.ts` for clarity.
 */

/**
 * Provider type strings are now driven by the runtime configuration file.
 * To remain flexible we use a string alias for provider identifiers. Code
 * should prefer deriving known provider strings from the configuration
 * (via `getProviderTypesFromConfig`) rather than relying on a compile-time
 * enum.
 */
export type AIProviderType = string

export interface AIUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface AIResponse {
  /** Raw text content returned by the provider */
  content: string
  /** Optional token usage metadata */
  usage?: AIUsage
  /** The model identifier used (provider-specific) */
  model?: string
  /** Which provider produced this response (string identifier from config) */
  provider: AIProviderType
  /** Timestamp when the response was produced */
  timestamp: string
}

export interface AIStructuredResponse<T = any> extends AIResponse {
  /** Parsed JSON/structured result */
  parsed: T
  /** Raw content before parsing */
  raw_content?: string
}

export interface AIProviderConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  // provider specific options bag
  [key: string]: any
}

export interface AIConfig {
  /** Primary provider to use by default */
  primaryProvider: AIProviderType
  /** Optional ordered list of fallback providers */
  fallbackProviders?: AIProviderType[]
  /** API keys or credentials per provider */
  credentials?: Partial<Record<AIProviderType, string | Record<string, any>>> 
  /** Optional per-provider configuration */
  providerConfigs?: Partial<Record<AIProviderType, AIProviderConfig>>
}

/**
 * Contract that every AI provider implementation must satisfy.
 * Implementations should be lightweight adapters that initialize clients
 * lazily and avoid side-effects during module import so they are easy to
 * mock in tests and safe to construct at runtime when DI occurs.
 */
export interface AIProviderInterface {
  /** Returns which provider type this implementation represents */
  getProviderType(): AIProviderType

  /**
   * Quick availability check (e.g. presence of credentials or a lightweight ping)
   * Should not throw for normal missing-credentials cases but return false.
   */
  isAvailable(): Promise<boolean>

  /**
   * Return true when this provider runs locally (no external network/API calls)
   * and false when it is a remote/cloud API. Useful for routing and display.
   */
  isLocal(): boolean

  /**
   * Generate a plain text completion for the given prompt.
   * Implementations should accept an options override for model/temperature/etc.
   */
  generateCompletion(prompt: string, options?: AIProviderConfig): Promise<AIResponse>

  /**
   * Generate a structured (JSON) response. Implementations may wrap generateCompletion
   * and attempt to parse JSON safely, returning parsed content or throwing a
   * well-documented error when parsing fails.
   */
  generateStructuredResponse<T = any>(
    prompt: string,
    schema?: any,
    options?: AIProviderConfig
  ): Promise<AIStructuredResponse<T>>

  /**
   * Validate configuration (credentials, access) and return true when the provider
   * is usable. May perform a light-weight API call if necessary. Should throw only
   * for unexpected errors.
   */
  validateConfig?(): Promise<boolean>
}

export interface AIError {
  code: string
  message: string
  provider?: AIProviderType
  retryable?: boolean
  details?: any
}

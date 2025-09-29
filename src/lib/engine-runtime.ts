import type { AIEnginesConfig, EngineEntry } from './ai-engines-config'
import loadConfigWithEnvCredentials from './secrets'

/**
 * Runtime metadata derived from configuration + environment.
 * Non-sensitive convenience fields that help initialize provider clients.
 */
export interface AIEngineOptions {
  endpoint?: string
  // provider short name (same as EngineEntry.provider)
  provider?: string
  clientOptions?: Record<string, any>
  // resolved/merged credentials (kept generic to support providers)
  credentials?: Record<string, unknown>
}

/**
 * Final configuration object for an AI engine (default engine only).
 * Extends the EngineEntry (which contains id/provider/params/credentials)
 * and adds a `runtime` section with derived fields.
 */
export interface AIEngineConfig extends Omit<EngineEntry, 'credentials'> {
  // explicitly include id on the interface (redundant with EngineEntry but
  // called out per request for clarity in typed code).
  id: string
  options: AIEngineOptions
}

/**
 * Build the AIEngineConfig only for the configured default engine.
 * It merges environment secrets using loadConfigWithEnvCredentials and
 * returns the engine entry augmented with a runtime object.
 */
export function buildDefaultEngineConfig(cfg?: AIEnginesConfig): AIEngineConfig {
  const merged = loadConfigWithEnvCredentials(cfg)
  const defaultId = merged.default
  const engine = merged.engines.find(e => e.id === defaultId)
  if (!engine) throw new Error(`Default engine '${defaultId}' not found in config`)

  const options: AIEngineOptions = {
    endpoint: `/api/ai/${engine.id}`,
    provider: engine.provider,
    clientOptions: engine.params || {},
    credentials: engine.credentials || undefined
  }

  // Return the engine entry with credentials removed to avoid duplication.
  const { credentials: _creds, ...engineWithoutCreds } = engine as any
  return { ...(engineWithoutCreds as Omit<EngineEntry, 'credentials'>), id: engine.id, options }
}

export default buildDefaultEngineConfig

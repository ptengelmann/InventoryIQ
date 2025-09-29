import { getAIEnginesConfig } from './ai-engines-config'
import type { AIEnginesConfig, EngineEntry } from './ai-engines-config'

function envKeyForEngine(engineId: string) {
  return 'AI_ENGINE_' + engineId.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_APIKEY'
}

/**
 * Merge secrets from environment variables and SECRETS_JSON into the AI engines config.
 * This function is server-only and must not be used in client bundles.
 */
export function loadConfigWithEnvCredentials(cfg?: AIEnginesConfig): AIEnginesConfig {
  const base = cfg ?? getAIEnginesConfig()
  const cloned: AIEnginesConfig = {
    default: base.default,
    engines: base.engines.map((e: EngineEntry) => ({ ...e, credentials: { ...(e.credentials || {}) } }))
  }

  // Per-engine env vars: AI_ENGINE_<ENGINE_ID>_APIKEY
  for (const engine of cloned.engines) {
    const key = envKeyForEngine(engine.id)
    const envVal = process.env[key]
    if (envVal) {
      engine.credentials = { ...(engine.credentials || {}), apiKey: envVal }
    }
  }

  // Optional single JSON blob with secrets mapping: { "engine-id": { apiKey: "..." } }
  if (process.env.SECRETS_JSON) {
    try {
      const json = JSON.parse(process.env.SECRETS_JSON)
      for (const engine of cloned.engines) {
        if (json[engine.id]) {
          engine.credentials = { ...(engine.credentials || {}), ...json[engine.id] }
        }
      }
    } catch (e) {
      console.warn('Invalid SECRETS_JSON, ignoring')
    }
  }

  return cloned
}

export default loadConfigWithEnvCredentials

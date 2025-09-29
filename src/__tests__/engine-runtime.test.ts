import { beforeEach, afterEach, describe, expect, it } from '@jest/globals'

import fs from 'fs'
import path from 'path'

import buildDefaultEngineConfig from '@/lib/engine-runtime'
import { loadAIEnginesConfig } from '@/lib/ai-engines-config'

const CONFIG_PATH = path.resolve(process.cwd(), 'ai-engines.config.json')

describe('buildDefaultEngineConfig', () => {
  let origEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    origEnv = { ...process.env }
    // ensure loader uses project config
    delete process.env.AI_ENGINES_CONFIG
    delete process.env.SECRETS_JSON
  })

  afterEach(() => {
    process.env = origEnv
  })

  it('builds the default engine with runtime endpoint', () => {
    const built = buildDefaultEngineConfig()
    expect(built).toHaveProperty('id')
    expect(built).toHaveProperty('provider')
    expect(built.options).toBeDefined()
    expect(built.options.endpoint).toContain(built.id)
  })

  it('merges per-engine env API key into credentials for default engine', () => {
    // load config to know default id
    const cfg = loadAIEnginesConfig()
    const defaultId = cfg.default
    const envKey = 'AI_ENGINE_' + defaultId.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_APIKEY'
    process.env[envKey] = 'env-key-123'

    const built = buildDefaultEngineConfig()
    expect(built.options).toBeDefined()
    expect(built.options.credentials).toBeDefined()
    expect((built.options.credentials as any).apiKey).toBe('env-key-123')
  })

  it('prefers SECRETS_JSON values when provided', () => {
    const cfg = loadAIEnginesConfig()
    const defaultId = cfg.default
    process.env.SECRETS_JSON = JSON.stringify({ [defaultId]: { apiKey: 'secret-json-key' } })

    const built = buildDefaultEngineConfig()
    expect(built.options).toBeDefined()
    expect((built.options.credentials as any).apiKey).toBe('secret-json-key')
  })
})

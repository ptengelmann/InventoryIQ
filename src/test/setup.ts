// Test setup - provide safe defaults for API keys so tests don't attempt network calls
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'test-anthropic-key'
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key'
process.env.GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY || 'test-google-key'

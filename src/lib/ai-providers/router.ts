import { AIProviderInterface, AIProviderType } from './ai-provider-types'

export class ProviderRouter {
  private providers: Map<AIProviderType, AIProviderInterface>
  private defaultProviderType: AIProviderType

  constructor(providers: Map<AIProviderType, AIProviderInterface>, defaultProviderType: AIProviderType) {
    this.providers = providers
    this.defaultProviderType = defaultProviderType
  }

  private getProvider(providerType?: AIProviderType): AIProviderInterface {
    const pt = providerType || this.defaultProviderType
    const provider = this.providers.get(pt)
    if (!provider) throw new Error(`Provider not found for type ${pt}`)
    return provider
  }

  /**
   * Generate a text completion. If options.providerType is provided it will be used
   * to select the provider, otherwise the router's default provider is used.
   */
  async generateCompletion(prompt: string, options?: any) {
    const providerType: AIProviderType | undefined = options?.providerType
    const provider = this.getProvider(providerType)
    return provider.generateCompletion(prompt, options)
  }

  /**
   * Generate a structured response using the schema. Accepts optional options.providerType
   */
  async generateStructuredResponse(prompt: string, schema?: any, options?: any) {
    const providerType: AIProviderType | undefined = options?.providerType
    const provider = this.getProvider(providerType)
    return provider.generateStructuredResponse(prompt, schema, options)
  }
}

export default ProviderRouter

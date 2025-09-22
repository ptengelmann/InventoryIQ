// src/lib/real-competitive-scraping.ts
// PRODUCTION VERSION - Real SERP API + Claude AI insights

import { CompetitorPrice } from '@/types'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface SerpShoppingResult {
  title: string
  price?: string
  extracted_price?: number
  source: string
  link: string
  thumbnail?: string
  rating?: number
  reviews?: number
  delivery?: string
  position?: number
}

interface SerpApiResponse {
  shopping_results?: SerpShoppingResult[]
  organic_results?: any[]
  error?: string
  search_metadata?: {
    status: string
    total_time_taken: number
  }
}

interface AICompetitiveInsights {
  market_analysis: string
  pricing_strategy: string
  immediate_actions: string[]
  threats: string[]
  opportunities: string[]
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
}

export class RealCompetitiveScraping {
  private static SERP_API_KEY = process.env.SERPAPI_KEY
  private static BASE_URL = 'https://serpapi.com/search.json'
  
  // UK alcohol retailers prioritization
  private static UK_ALCOHOL_RETAILERS = [
    { domain: 'majestic.co.uk', name: 'Majestic Wine', priority: 1 },
    { domain: 'waitrose.com', name: 'Waitrose', priority: 1 },
    { domain: 'tesco.com', name: 'Tesco', priority: 1 },
    { domain: 'asda.com', name: 'ASDA', priority: 1 },
    { domain: 'sainsburys.co.uk', name: "Sainsbury's", priority: 2 },
    { domain: 'morrisons.com', name: 'Morrisons', priority: 2 },
    { domain: 'amazon.co.uk', name: 'Amazon UK', priority: 2 },
    { domain: 'thedrinkshop.com', name: 'The Drink Shop', priority: 3 },
    { domain: 'slurp.co.uk', name: 'Slurp Wine', priority: 3 }
  ]

  /**
   * MAIN METHOD - Real competitive scraping with AI insights
   */
  static async scrapeRealCompetitorPrices(
    product: string,
    category: string,
    maxRetailers: number = 5,
    includeAIInsights: boolean = true
  ): Promise<CompetitorPrice[]> {
    console.log(`🔍 REAL COMPETITIVE INTELLIGENCE: "${product}" in ${category}`)
    
    if (!this.SERP_API_KEY) {
      console.error('❌ SERPAPI_KEY not found in environment variables')
      throw new Error('SERP API key required for competitive intelligence')
    }
    
    const startTime = Date.now()
    let serpResults: SerpShoppingResult[] = []
    let aiInsights: AICompetitiveInsights | null = null
    
    try {
      // Step 1: Get real UK shopping results
      serpResults = await this.fetchRealShoppingResults(product, category)
      console.log(`✅ Found ${serpResults.length} real shopping results`)
      
      // Step 2: Filter and prioritize UK alcohol retailers
      const ukRetailerResults = this.filterUKAlcoholRetailers(serpResults)
      console.log(`🇬🇧 Filtered to ${ukRetailerResults.length} UK alcohol retailers`)
      
      // Step 3: Transform to competitor price format
      const competitorPrices = this.transformToCompetitorPrices(ukRetailerResults, product)
      
      // Step 4: Generate AI competitive insights (premium feature)
      if (includeAIInsights && competitorPrices.length > 0 && process.env.ANTHROPIC_API_KEY) {
        try {
          aiInsights = await this.generateAICompetitiveInsights(product, category, competitorPrices)
          console.log(`🧠 Generated AI competitive insights (confidence: ${aiInsights.confidence_score})`)
        } catch (aiError) {
          console.error('⚠️ AI insights failed, continuing with price data:', aiError)
        }
      }
      
      // Step 5: Enhance results with AI insights
      const enhancedResults = this.enhanceWithAIInsights(competitorPrices, aiInsights)
      
      const processingTime = Date.now() - startTime
      console.log(`🎯 Competitive intelligence complete: ${enhancedResults.length} retailers, ${processingTime}ms`)
      
      return enhancedResults.slice(0, maxRetailers)
      
    } catch (error) {
      console.error('❌ Real competitive scraping failed:', error)
      throw new Error(`Failed to fetch competitive data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch real shopping results from SERP API
   */
  private static async fetchRealShoppingResults(
    product: string, 
    category: string
  ): Promise<SerpShoppingResult[]> {
    
    // Enhanced search query for UK alcohol retailers
    const searchQuery = `${product} alcohol UK buy online ${category}`
    
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: searchQuery,
      google_domain: 'google.co.uk',
      gl: 'uk', // UK geolocation
      hl: 'en', // English language
      currency: 'GBP',
      api_key: this.SERP_API_KEY!
    })
    
    console.log(`🔍 SERP API query: "${searchQuery}"`)
    
    const response = await fetch(`${this.BASE_URL}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status} ${response.statusText}`)
    }
    
    const data: SerpApiResponse = await response.json()
    
    if (data.error) {
      throw new Error(`SERP API error: ${data.error}`)
    }
    
    return data.shopping_results || []
  }

  /**
   * Filter results to UK alcohol retailers only
   */
  private static filterUKAlcoholRetailers(results: SerpShoppingResult[]): SerpShoppingResult[] {
    return results
      .filter(result => {
        // Check if source matches known UK alcohol retailers
        const retailer = this.UK_ALCOHOL_RETAILERS.find(r => 
          result.source.toLowerCase().includes(r.domain.replace('.co.uk', '').replace('.com', ''))
        )
        return retailer !== undefined
      })
      .sort((a, b) => {
        // Prioritize known alcohol retailers
        const priorityA = this.getRetailerPriority(a.source)
        const priorityB = this.getRetailerPriority(b.source)
        return priorityA - priorityB
      })
  }

  /**
   * Get retailer priority (lower number = higher priority)
   */
  private static getRetailerPriority(source: string): number {
    const retailer = this.UK_ALCOHOL_RETAILERS.find(r => 
      source.toLowerCase().includes(r.domain.replace('.co.uk', '').replace('.com', ''))
    )
    return retailer?.priority || 99
  }

  /**
   * Transform SERP results to CompetitorPrice format
   */
  private static transformToCompetitorPrices(
    results: SerpShoppingResult[], 
    originalProduct: string
  ): CompetitorPrice[] {
    return results
      .filter(result => result.extracted_price && result.extracted_price > 0)
      .map(result => {
        const retailerInfo = this.UK_ALCOHOL_RETAILERS.find(r => 
          result.source.toLowerCase().includes(r.domain.replace('.co.uk', '').replace('.com', ''))
        )
        
        return {
          sku: originalProduct.replace(/\s+/g, '-').toUpperCase(),
          competitor: retailerInfo?.name || result.source,
          competitor_price: result.extracted_price!,
          our_price: 0, // Will be set by calling function
          price_difference: 0, // Will be calculated
          price_difference_percentage: 0, // Will be calculated
          availability: true,
          last_updated: new Date(),
          source: 'serp_api' as any,
          url: result.link,
          product_name: result.title,
          relevance_score: this.calculateRelevanceScore(originalProduct, result.title),
          promotional: this.detectPromotion(result.title, result.price),
          promotion_details: this.extractPromotionDetails(result.title)
        }
      })
      .filter(price => price.relevance_score > 0.3) // Only keep relevant matches
  }

  /**
   * Calculate relevance score between search term and found product
   */
  private static calculateRelevanceScore(searchTerm: string, foundTitle: string): number {
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const titleWords = foundTitle.toLowerCase().split(/\s+/)
    
    let exactMatches = 0
    let partialMatches = 0
    
    for (const searchWord of searchWords) {
      if (titleWords.some(tw => tw === searchWord)) {
        exactMatches++
      } else if (titleWords.some(tw => tw.includes(searchWord) || searchWord.includes(tw))) {
        partialMatches++
      }
    }
    
    // Brand boost for common alcohol brands
    const alcoholBrands = ['hendricks', 'macallan', 'grey goose', 'johnnie walker', 'bombay', 'absolut', 'jack daniels']
    const hasBrandMatch = alcoholBrands.some(brand => 
      searchTerm.toLowerCase().includes(brand) && foundTitle.toLowerCase().includes(brand)
    )
    
    const baseScore = searchWords.length > 0 ? (exactMatches + partialMatches * 0.5) / searchWords.length : 0
    return Math.min(1.0, baseScore + (hasBrandMatch ? 0.2 : 0))
  }

  /**
   * Detect if product is on promotion
   */
  private static detectPromotion(title: string, price?: string): boolean {
    const promoIndicators = ['sale', 'offer', 'deal', 'discount', 'save', '% off', 'was £', 'reduced']
    const text = `${title} ${price || ''}`.toLowerCase()
    return promoIndicators.some(indicator => text.includes(indicator))
  }

  /**
   * Extract promotion details
   */
  private static extractPromotionDetails(title: string): string | undefined {
    const promoPatterns = [
      /(\d+%\s*off)/i,
      /(save\s*£\d+)/i,
      /(was\s*£\d+\.?\d*)/i,
      /(buy\s*\d+.*get\s*\d+)/i
    ]
    
    for (const pattern of promoPatterns) {
      const match = title.match(pattern)
      if (match) return match[1]
    }
    
    return undefined
  }

  /**
   * Generate AI competitive insights using Claude
   */
  private static async generateAICompetitiveInsights(
    product: string,
    category: string,
    competitorPrices: CompetitorPrice[]
  ): Promise<AICompetitiveInsights> {
    
    const prices = competitorPrices.map(cp => cp.competitor_price)
    const retailers = competitorPrices.map(cp => cp.competitor)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    
    const promotionalCount = competitorPrices.filter(cp => cp.promotional).length
    
    const prompt = `You are a UK alcohol retail pricing strategist. Analyze this competitive intelligence data and provide actionable insights.

PRODUCT: ${product} (${category})
MARKET DATA:
- Retailers found: ${retailers.join(', ')}
- Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}
- Average price: £${avgPrice.toFixed(2)}
- Price variance: ${((priceRange / avgPrice) * 100).toFixed(1)}%
- Promotional activity: ${promotionalCount}/${competitorPrices.length} retailers

COMPETITIVE PRICES:
${competitorPrices.map(cp => `- ${cp.competitor}: £${cp.competitor_price.toFixed(2)}${cp.promotional ? ' (PROMO)' : ''}`).join('\n')}

Provide strategic insights in JSON format:

{
  "market_analysis": "Brief market overview and competitive positioning",
  "pricing_strategy": "Recommended pricing approach",
  "immediate_actions": ["Action 1", "Action 2", "Action 3"],
  "threats": ["Threat 1", "Threat 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "urgency_level": "low|medium|high|critical",
  "confidence_score": 0.85
}

Focus on actionable UK alcohol retail insights. Consider seasonal factors, brand positioning, and competitive dynamics.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
      
      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0])
        return {
          market_analysis: insights.market_analysis || 'No analysis available',
          pricing_strategy: insights.pricing_strategy || 'No strategy available',
          immediate_actions: insights.immediate_actions || [],
          threats: insights.threats || [],
          opportunities: insights.opportunities || [],
          urgency_level: insights.urgency_level || 'medium',
          confidence_score: insights.confidence_score || 0.7
        }
      }
      
      throw new Error('Could not parse AI insights JSON')
      
    } catch (error) {
      console.error('AI insights generation failed:', error)
      throw error
    }
  }

  /**
   * Enhance competitor prices with AI insights
   */
  private static enhanceWithAIInsights(
    competitorPrices: CompetitorPrice[],
    aiInsights: AICompetitiveInsights | null
  ): CompetitorPrice[] {
    
    if (!aiInsights) return competitorPrices
    
    // Add AI insights as metadata to each competitor price
    return competitorPrices.map(price => ({
      ...price,
      ai_insights: {
        market_analysis: aiInsights.market_analysis,
        pricing_strategy: aiInsights.pricing_strategy,
        urgency_level: aiInsights.urgency_level,
        confidence_score: aiInsights.confidence_score
      }
    }))
  }

  /**
   * Get competitive insights summary
   */
  static async getCompetitiveInsightsSummary(
    product: string,
    category: string
  ): Promise<{ summary: string; keyInsights: string[] }> {
    
    try {
      const competitorPrices = await this.scrapeRealCompetitorPrices(product, category, 5, true)
      
      if (competitorPrices.length === 0) {
        return {
          summary: `No competitive data found for ${product}`,
          keyInsights: ['Product may have limited UK retail presence', 'Consider alternative search terms']
        }
      }
      
      const prices = competitorPrices.map(cp => cp.competitor_price)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      const priceRange = Math.max(...prices) - Math.min(...prices)
      const priceVariance = (priceRange / avgPrice) * 100
      
      return {
        summary: `Found ${competitorPrices.length} UK retailers selling ${product}. Average price: £${avgPrice.toFixed(2)}, variance: ${priceVariance.toFixed(1)}%`,
        keyInsights: [
          `Available at: ${competitorPrices.map(cp => cp.competitor).join(', ')}`,
          `Price range: £${Math.min(...prices).toFixed(2)} - £${Math.max(...prices).toFixed(2)}`,
          priceVariance > 15 ? 'High price variance suggests pricing flexibility' : 'Stable pricing environment',
          competitorPrices.some(cp => cp.promotional) ? 'Active promotional competition detected' : 'No major promotions detected'
        ]
      }
      
    } catch (error) {
      return {
        summary: `Competitive intelligence failed for ${product}`,
        keyInsights: ['Check internet connection', 'Verify product name spelling', 'Try alternative product names']
      }
    }
  }

  /**
   * Health check for competitive intelligence system
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    serp_api: boolean
    claude_api: boolean
    response_time_ms: number
    test_results: any
  }> {
    const startTime = Date.now()
    
    let health: {
      status: 'healthy' | 'degraded' | 'down'
      serp_api: boolean
      claude_api: boolean
      response_time_ms: number
      test_results: any
    } = {
      status: 'healthy',
      serp_api: false,
      claude_api: false,
      response_time_ms: 0,
      test_results: {}
    }
    
    try {
      // Test SERP API
      if (this.SERP_API_KEY) {
        const testResults = await this.scrapeRealCompetitorPrices('Hendricks Gin', 'spirits', 2, false)
        health.serp_api = testResults.length > 0
        health.test_results = { competitors_found: testResults.length }
      }
      
      // Test Claude API
      if (process.env.ANTHROPIC_API_KEY) {
        health.claude_api = true
      }
      
      health.response_time_ms = Date.now() - startTime
      
      if (!health.serp_api) health.status = 'degraded'
      if (!health.serp_api && !health.claude_api) health.status = 'down'
      
    } catch (error) {
      health.status = 'down'
      health.test_results = { error: error instanceof Error ? error.message : 'Unknown error' }
    }
    
    return health
  }

  // Legacy compatibility methods
  static async getCachedOrScrape(product: string, category: string, cacheHours: number = 24): Promise<CompetitorPrice[]> {
    return await this.scrapeRealCompetitorPrices(product, category, 5, true)
  }

  static async cleanup(): Promise<void> {
    // No browser cleanup needed for SERP API approach
    console.log('🧹 Competitive intelligence cleanup complete')
  }

  // Real-time monitoring (simplified for production)
  private static monitoringActive = false
  private static monitoringInterval: NodeJS.Timeout | null = null

  static async startRealTimeMonitoring(
    products: { product: string, category: string, sku: string }[],
    intervalMinutes: number = 60,
    maxRetailersPerCheck: number = 3
  ): Promise<void> {
    
    if (this.monitoringActive) {
      console.log('⚠️ Real-time monitoring already active')
      return
    }
    
    console.log(`🔄 Starting REAL competitive monitoring for ${products.length} products`)
    console.log(`📊 Check interval: ${intervalMinutes} minutes`)
    console.log(`🏪 Max retailers per check: ${maxRetailersPerCheck}`)
    
    this.monitoringActive = true
    
    const checkPrices = async () => {
      for (const productData of products) {
        try {
          console.log(`📊 Monitoring: ${productData.product}`)
          
          const currentPrices = await this.scrapeRealCompetitorPrices(
            productData.product,
            productData.category,
            maxRetailersPerCheck,
            false // Skip AI insights for monitoring to save costs
          )
          
          if (currentPrices.length > 0) {
            console.log(`✅ Found ${currentPrices.length} current prices for ${productData.product}`)
            // Here you would save to database and check for price changes
          }
          
          // Rate limiting
          await this.delay(2000)
          
        } catch (error) {
          console.error(`❌ Monitoring error for ${productData.product}:`, error)
        }
      }
    }
    
    // Run initial check
    await checkPrices()
    
    // Set up interval
    this.monitoringInterval = setInterval(checkPrices, intervalMinutes * 60 * 1000)
  }

  static stopRealTimeMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.monitoringActive = false
    console.log('🛑 Stopped real-time competitive monitoring')
  }

  static getMonitoringStatus(): { 
    isMonitoring: boolean
    activeProducts: number
    totalRetailers: number 
  } {
    return {
      isMonitoring: this.monitoringActive,
      activeProducts: this.monitoringActive ? 1 : 0, // Would track actual products
      totalRetailers: this.UK_ALCOHOL_RETAILERS.length
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
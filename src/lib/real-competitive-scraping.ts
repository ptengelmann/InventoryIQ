// src/lib/real-competitive-scraping.ts
// PRODUCTION VERSION - Real SERP API + Claude AI insights with Dynamic Product Name Transformation

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

interface ProductSearchContext {
  sku_code: string
  product_name?: string
  brand?: string
  subcategory?: string
  category?: string
  price?: number
  weekly_sales?: number
}

interface ProductNameAnalysis {
  searchTerm: string
  displayName: string
  confidence: number
  extractedBrand: string
  extractedType: string
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

  // Alcohol type indicators for dynamic detection
  private static ALCOHOL_TYPES = {
    wine: [
      'wine', 'red', 'white', 'rose', 'sparkling', 'champagne', 'prosecco', 'cava',
      'chardonnay', 'merlot', 'cabernet', 'sauvignon', 'pinot', 'riesling', 'shiraz', 
      'malbec', 'tempranillo', 'sangiovese', 'grenache', 'chianti', 'bordeaux', 
      'burgundy', 'rioja', 'barolo', 'brunello', 'muscadet', 'gewurztraminer'
    ],
    spirits: [
      'vodka', 'gin', 'whisky', 'whiskey', 'rum', 'brandy', 'cognac', 'tequila', 
      'mezcal', 'absinthe', 'sambuca', 'schnapps', 'ouzo', 'armagnac', 'calvados'
    ],
    beer: [
      'beer', 'lager', 'ale', 'stout', 'porter', 'ipa', 'wheat', 'pilsner', 
      'bitter', 'mild', 'weiss', 'bock', 'saison'
    ],
    liqueur: [
      'liqueur', 'cream', 'coffee', 'amaretto', 'baileys', 'kahlua', 'sambuca', 
      'limoncello', 'cointreau', 'grand', 'marnier'
    ],
    fortified: ['sherry', 'port', 'madeira', 'vermouth', 'marsala']
  }

  /**
   * MAIN METHOD - Enhanced competitive scraping with dynamic product name transformation
   */
  static async scrapeRealCompetitorPrices(
    productInput: string | ProductSearchContext,
    category: string,
    maxRetailers: number = 5,
    includeAIInsights: boolean = true
  ): Promise<CompetitorPrice[]> {
    
    console.log('Starting competitive scraping with input:', productInput)
    
    if (!this.SERP_API_KEY) {
      console.error('SERPAPI_KEY not found in environment variables')
      throw new Error('SERP API key required for competitive intelligence')
    }
    
    const startTime = Date.now()
    
    // Transform input to searchable product name
    const productAnalysis = this.analyzeAndTransformProduct(productInput, category)
    console.log('Product analysis result:', productAnalysis)
    
    try {
      // Primary search with optimized product name
      let serpResults = await this.performSearch(productAnalysis.searchTerm, category, 'primary')
      console.log(`Primary search found ${serpResults.length} results`)
      
      // Fallback search if needed
      if (serpResults.length === 0 && productAnalysis.confidence < 0.8) {
        const fallbackTerm = this.createFallbackSearchTerm(productAnalysis)
        serpResults = await this.performSearch(fallbackTerm, category, 'fallback')
        console.log(`Fallback search found ${serpResults.length} results`)
      }
      
      // Filter to UK alcohol retailers
      const ukRetailerResults = this.filterUKAlcoholRetailers(serpResults)
      console.log(`Filtered to ${ukRetailerResults.length} UK alcohol retailers`)
      
      // Transform to competitor price format
      const competitorPrices = this.transformToCompetitorPrices(
        ukRetailerResults, 
        this.getOriginalSKU(productInput),
        productAnalysis.searchTerm
      )
      
      // Generate AI insights if requested
      let enhancedResults = competitorPrices
      if (includeAIInsights && competitorPrices.length > 0 && process.env.ANTHROPIC_API_KEY) {
        try {
          const aiInsights = await this.generateAICompetitiveInsights(
            productAnalysis.searchTerm, 
            category, 
            competitorPrices
          )
          enhancedResults = this.enhanceWithAIInsights(competitorPrices, aiInsights)
          console.log('AI insights generated successfully')
        } catch (aiError) {
          console.error('AI insights failed:', aiError)
        }
      }
      
      const processingTime = Date.now() - startTime
      console.log(`Competitive intelligence complete: ${enhancedResults.length} results in ${processingTime}ms`)
      
      return enhancedResults.slice(0, maxRetailers)
      
    } catch (error) {
      console.error('Competitive scraping failed:', error)
      throw new Error(`Failed to fetch competitive data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze and transform product input into optimal search terms
   */
  private static analyzeAndTransformProduct(
    productInput: string | ProductSearchContext, 
    category: string
  ): ProductNameAnalysis {
    
    let productContext: ProductSearchContext
    
    if (typeof productInput === 'string') {
      productContext = {
        sku_code: productInput,
        category: category
      }
    } else {
      productContext = productInput
    }
    
    console.log('Analyzing product context:', productContext)
    
    // Strategy 1: Use product_name if available and clean
    if (productContext.product_name && 
        productContext.product_name !== 'Unknown' && 
        productContext.product_name.length > 2 &&
        !productContext.product_name.toLowerCase().includes('sku') &&
        !productContext.product_name.toLowerCase().includes('code')) {
      
      const cleanName = this.cleanProductName(productContext.product_name)
      return {
        searchTerm: cleanName,
        displayName: productContext.product_name,
        confidence: 0.9,
        extractedBrand: productContext.brand || '',
        extractedType: productContext.category || category
      }
    }
    
    // Strategy 2: Use brand + category/subcategory
    if (productContext.brand && 
        productContext.brand !== 'Unknown' && 
        productContext.brand.length > 1) {
      
      const productType = productContext.subcategory || productContext.category || category
      const searchTerm = `${productContext.brand} ${productType}`.trim()
      
      return {
        searchTerm: searchTerm,
        displayName: searchTerm,
        confidence: 0.8,
        extractedBrand: productContext.brand,
        extractedType: productType
      }
    }
    
    // Strategy 3: Dynamic extraction from SKU
    return this.extractFromSKUDynamically(productContext.sku_code, category)
  }

  /**
   * Dynamically extract product information from SKU codes
   */
  private static extractFromSKUDynamically(skuCode: string, category: string): ProductNameAnalysis {
    console.log('Performing dynamic SKU extraction for:', skuCode)
    
    // Clean and tokenize the SKU
    const cleaned = skuCode
      .replace(/[-_]/g, ' ')
      .replace(/\b(sku|code|item|product|ref)\b/gi, '')
      .replace(/\d{4,}/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    const tokens = cleaned.split(/\s+/).filter(w => w.length > 1)
    console.log('Extracted tokens:', tokens)
    
    // Detect alcohol type from tokens
    const detectedType = this.detectAlcoholType(tokens)
    console.log('Detected alcohol type:', detectedType)
    
    // Extract brand name candidates
    const brandCandidates = this.extractBrandCandidates(tokens, detectedType)
    console.log('Brand candidates:', brandCandidates)
    
    // Build final search term
    let searchTerm = ''
    let displayName = ''
    let confidence = 0.3
    
    if (brandCandidates.length > 0) {
      const brand = brandCandidates.join(' ')
      const type = detectedType || category
      searchTerm = `${brand} ${type}`.trim()
      displayName = brand
      confidence = detectedType ? 0.7 : 0.5
    } else if (detectedType) {
      searchTerm = `${detectedType} ${category}`.trim()
      displayName = detectedType
      confidence = 0.4
    } else {
      // Last resort: clean the SKU as much as possible
      searchTerm = this.cleanSKUForSearch(skuCode)
      displayName = searchTerm
      confidence = 0.2
    }
    
    return {
      searchTerm: searchTerm,
      displayName: displayName,
      confidence: confidence,
      extractedBrand: brandCandidates.join(' '),
      extractedType: detectedType || category
    }
  }

  /**
   * Detect alcohol type from tokens
   */
  private static detectAlcoholType(tokens: string[]): string {
    const lowerTokens = tokens.map(t => t.toLowerCase())
    
    for (const [type, indicators] of Object.entries(this.ALCOHOL_TYPES)) {
      const matches = lowerTokens.filter(token => 
        indicators.some(indicator => 
          token.includes(indicator) || indicator.includes(token)
        )
      )
      
      if (matches.length > 0) {
        // Return the most specific match found
        const bestMatch = matches.find(match => 
          indicators.includes(match)
        ) || matches[0]
        
        return this.capitalizeFirst(bestMatch)
      }
    }
    
    return ''
  }

  /**
   * Extract brand name candidates from tokens
   */
  private static extractBrandCandidates(tokens: string[], detectedType: string): string[] {
    const commonWords = ['the', 'and', 'of', 'with', 'from', 'bottle', 'pack', 'case', 'ml', 'cl', 'l', 'litre', 'liter']
    const allTypeIndicators = Object.values(this.ALCOHOL_TYPES).flat()
    
    return tokens
      .filter(token => {
        const lower = token.toLowerCase()
        return !commonWords.includes(lower) && 
               !allTypeIndicators.includes(lower) &&
               !/^\d+$/.test(token) &&
               token.length > 2 &&
               lower !== detectedType.toLowerCase()
      })
      .slice(0, 3) // Take up to 3 words for brand name
      .map(word => this.capitalizeFirst(word))
  }

  /**
   * Clean product names for search optimization
   */
  private static cleanProductName(productName: string): string {
    return productName
      .replace(/[-_]/g, ' ')
      .replace(/\b(ml|cl|l|litre|liter|\d+%|abv|vol)\b/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Clean SKU codes as last resort
   */
  private static cleanSKUForSearch(skuCode: string): string {
    return skuCode
      .replace(/[-_]/g, ' ')
      .replace(/\b(sku|code|item|product)\b/gi, '')
      .replace(/\d{6,}/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Create fallback search term for low confidence results
   */
  private static createFallbackSearchTerm(analysis: ProductNameAnalysis): string {
    if (analysis.extractedBrand) {
      return analysis.extractedBrand
    }
    if (analysis.extractedType) {
      return analysis.extractedType
    }
    return 'alcohol'
  }

  /**
   * Get original SKU from input
   */
  private static getOriginalSKU(productInput: string | ProductSearchContext): string {
    return typeof productInput === 'string' ? productInput : productInput.sku_code
  }

  /**
   * Perform SERP API search
   */
  private static async performSearch(
    searchTerm: string, 
    category: string, 
    searchType: string
  ): Promise<SerpShoppingResult[]> {
    
    const searchQuery = `${searchTerm} UK`
    console.log(`SERP API search (${searchType}): "${searchQuery}"`)
    
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: searchQuery,
      google_domain: 'google.co.uk',
      gl: 'uk',
      hl: 'en',
      currency: 'GBP',
      api_key: this.SERP_API_KEY!,
      num: '20'
    })
    
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
   * Filter results to UK alcohol retailers
   */
  private static filterUKAlcoholRetailers(results: SerpShoppingResult[]): SerpShoppingResult[] {
    return results
      .filter(result => {
        const retailer = this.UK_ALCOHOL_RETAILERS.find(r => 
          result.source.toLowerCase().includes(r.domain.replace('.co.uk', '').replace('.com', ''))
        )
        return retailer !== undefined
      })
      .sort((a, b) => {
        const priorityA = this.getRetailerPriority(a.source)
        const priorityB = this.getRetailerPriority(b.source)
        return priorityA - priorityB
      })
  }

  /**
   * Get retailer priority
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
    originalSKU: string,
    searchTerm: string
  ): CompetitorPrice[] {
    return results
      .filter(result => result.extracted_price && result.extracted_price > 0)
      .map(result => {
        const retailerInfo = this.UK_ALCOHOL_RETAILERS.find(r => 
          result.source.toLowerCase().includes(r.domain.replace('.co.uk', '').replace('.com', ''))
        )
        
        return {
          sku: originalSKU,
          competitor: retailerInfo?.name || result.source,
          competitor_price: result.extracted_price!,
          our_price: 0,
          price_difference: 0,
          price_difference_percentage: 0,
          availability: true,
          last_updated: new Date(),
          source: 'serp_api' as any,
          url: result.link,
          product_name: result.title,
          relevance_score: this.calculateRelevanceScore(searchTerm, result.title),
          promotional: this.detectPromotion(result.title, result.price),
          promotion_details: this.extractPromotionDetails(result.title)
        }
      })
      .filter(price => price.relevance_score > 0.2)
      .sort((a, b) => b.relevance_score - a.relevance_score)
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
    
    const baseScore = searchWords.length > 0 ? (exactMatches + partialMatches * 0.4) / searchWords.length : 0
    
    // Boost for alcohol indicators
    const hasAlcoholIndicator = /\b(70cl|75cl|1l|750ml|wine|beer|spirits|gin|vodka|whisky|whiskey)\b/i.test(foundTitle)
    
    return Math.min(1.0, baseScore + (hasAlcoholIndicator ? 0.1 : 0))
  }

  /**
   * Detect promotional content
   */
  private static detectPromotion(title: string, price?: string): boolean {
    const promoIndicators = ['sale', 'offer', 'deal', 'discount', 'save', '% off', 'was £', 'reduced', 'special']
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
   * Generate AI competitive insights
   */
  private static async generateAICompetitiveInsights(
    product: string,
    category: string,
    competitorPrices: CompetitorPrice[]
  ): Promise<AICompetitiveInsights> {
    
    const prices = competitorPrices.map(cp => cp.competitor_price)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    const prompt = `Analyze this UK alcohol retail competitive data:

PRODUCT: ${product} (${category})
COMPETITORS: ${competitorPrices.map(cp => cp.competitor).join(', ')}
PRICE RANGE: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}
AVERAGE: £${avgPrice.toFixed(2)}

Provide JSON insights:
{
  "market_analysis": "Brief analysis",
  "pricing_strategy": "Recommendation", 
  "immediate_actions": ["Action 1", "Action 2"],
  "threats": ["Threat 1"],
  "opportunities": ["Opportunity 1"],
  "urgency_level": "medium",
  "confidence_score": 0.8
}`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      })
      
      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0])
        return {
          market_analysis: insights.market_analysis || 'Analysis unavailable',
          pricing_strategy: insights.pricing_strategy || 'Strategy unavailable',
          immediate_actions: insights.immediate_actions || [],
          threats: insights.threats || [],
          opportunities: insights.opportunities || [],
          urgency_level: insights.urgency_level || 'medium',
          confidence_score: insights.confidence_score || 0.7
        }
      }
      
    } catch (error) {
      console.error('AI insights generation failed:', error)
    }
    
    // Fallback insights
    return {
      market_analysis: `Found ${competitorPrices.length} competitors for ${product}`,
      pricing_strategy: avgPrice > minPrice ? 'Consider price optimization' : 'Monitor competitor changes',
      immediate_actions: ['Monitor price changes', 'Analyze competitor promotions'],
      threats: maxPrice > minPrice * 1.2 ? ['High price variance in market'] : [],
      opportunities: competitorPrices.some(cp => cp.promotional) ? ['Promotional opportunities available'] : [],
      urgency_level: 'medium' as const,
      confidence_score: 0.6
    }
  }

  /**
   * Enhance results with AI insights
   */
  private static enhanceWithAIInsights(
    competitorPrices: CompetitorPrice[],
    aiInsights: AICompetitiveInsights
  ): CompetitorPrice[] {
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
   * Utility function to capitalize first letter
   */
  private static capitalizeFirst(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }

  // Public interface methods

  /**
   * Enhanced method with full product context
   */
  static async scrapeWithProductContext(
    productContext: ProductSearchContext,
    maxRetailers: number = 5,
    includeAIInsights: boolean = true
  ): Promise<CompetitorPrice[]> {
    return this.scrapeRealCompetitorPrices(
      productContext,
      productContext.category || 'alcohol',
      maxRetailers,
      includeAIInsights
    )
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
          keyInsights: ['Product may have limited UK retail presence']
        }
      }
      
      const prices = competitorPrices.map(cp => cp.competitor_price)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      
      return {
        summary: `Found ${competitorPrices.length} UK retailers. Average price: £${avgPrice.toFixed(2)}`,
        keyInsights: [
          `Available at: ${competitorPrices.map(cp => cp.competitor).join(', ')}`,
          `Price range: £${Math.min(...prices).toFixed(2)} - £${Math.max(...prices).toFixed(2)}`
        ]
      }
    } catch (error) {
      return {
        summary: `Analysis failed for ${product}`,
        keyInsights: ['Check connection and try again']
      }
    }
  }

  /**
   * System health check
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    serp_api: boolean
    claude_api: boolean
    response_time_ms: number
  }> {
    const startTime = Date.now()
    
    let status: 'healthy' | 'degraded' | 'down' = 'healthy'
    let serp_api = false
    let claude_api = false
    
    try {
      if (this.SERP_API_KEY) {
        const testResults = await this.scrapeRealCompetitorPrices('Hendricks Gin', 'spirits', 1, false)
        serp_api = testResults.length > 0
      }
      
      claude_api = Boolean(process.env.ANTHROPIC_API_KEY)
      
      if (!serp_api) status = 'degraded'
      if (!serp_api && !claude_api) status = 'down'
      
    } catch (error) {
      status = 'down'
    }
    
    return {
      status,
      serp_api,
      claude_api,
      response_time_ms: Date.now() - startTime
    }
  }

  // Legacy compatibility
  static async getCachedOrScrape(product: string, category: string): Promise<CompetitorPrice[]> {
    return this.scrapeRealCompetitorPrices(product, category, 5, true)
  }

  static async cleanup(): Promise<void> {
    console.log('Competitive intelligence cleanup complete')
  }
}
// src/lib/gpt-commerce-intelligence.ts
// GPT-4 powered creative commerce recommendations for alcohol inventory

import { AlcoholSKU, CompetitorPrice } from '@/types'

interface SlowMovingProduct {
  sku: string
  category: string
  brand: string
  inventory_level: number
  weeks_since_last_sale: number
  price: number
  cost_price?: number
}

interface CreativeRecommendation {
  strategy_type: 'bundle' | 'mystery_box' | 'seasonal_promotion' | 'cross_category' | 'experience' | 'clearance'
  title: string
  description: string
  products_involved: string[]
  pricing_strategy: {
    individual_total: number
    bundle_price: number
    discount_percentage: number
    profit_margin: number
  }
  marketing_angle: string
  target_customer: string
  urgency: 'immediate' | 'within_week' | 'seasonal' | 'long_term'
  estimated_impact: {
    units_moved: number
    revenue_recovery: number
    inventory_clearance: number
  }
  implementation_steps: string[]
}

export class GPTCommerceIntelligence {
  private static openAIClient: any = null

  private static async getOpenAIClient() {
    if (!this.openAIClient) {
      const { OpenAI } = await import('openai')
      this.openAIClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
    return this.openAIClient
  }

  // Main function: Generate creative recommendations for slow-moving inventory
  static async generateCreativeRecommendations(
    slowMovingProducts: SlowMovingProduct[],
    allInventory: AlcoholSKU[],
    competitorData: CompetitorPrice[] = [],
    seasonalContext?: {
      current_season: string
      upcoming_holidays: string[]
      days_to_holiday: number
    }
  ): Promise<CreativeRecommendation[]> {
    
    try {
      const client = await this.getOpenAIClient()
      
      // Prepare context for GPT-4
      const inventoryContext = this.prepareInventoryContext(slowMovingProducts, allInventory)
      const competitiveContext = this.prepareCompetitiveContext(competitorData)
      const seasonal = seasonalContext || this.getCurrentSeasonalContext()
      
      const prompt = this.buildCreativeRecommendationPrompt(
        inventoryContext,
        competitiveContext,
        seasonal
      )

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      const gptResponse = JSON.parse(response.choices[0].message.content || '{}')
      
      // Process and validate GPT-4 recommendations
      return this.processGPTRecommendations(gptResponse, slowMovingProducts, allInventory)
      
    } catch (error) {
      console.error('GPT-4 recommendation generation failed:', error)
      
      // Fallback to rule-based recommendations
      return this.generateFallbackRecommendations(slowMovingProducts, allInventory, seasonalContext)
    }
  }

  // Generate inventory optimization insights
  static async generateInventoryInsights(
    allInventory: AlcoholSKU[],
    salesHistory: any[] = []
  ): Promise<{
    portfolio_analysis: string
    category_recommendations: string[]
    strategic_insights: string[]
    action_priorities: { action: string, impact: string, timeline: string }[]
  }> {
    
    try {
      const client = await this.getOpenAIClient()
      
      const portfolioData = this.analyzePortfolioComposition(allInventory)
      const performanceMetrics = this.calculatePortfolioMetrics(allInventory, salesHistory)
      
      const prompt = `
Analyze this UK alcohol business portfolio and provide strategic insights:

PORTFOLIO COMPOSITION:
${JSON.stringify(portfolioData, null, 2)}

PERFORMANCE METRICS:
${JSON.stringify(performanceMetrics, null, 2)}

CURRENT DATE: ${new Date().toLocaleDateString('en-GB')}

Provide strategic analysis focusing on:
1. Portfolio balance and gaps
2. Category performance vs UK market trends
3. Pricing strategy recommendations
4. Inventory optimization opportunities
5. Competitive positioning

Respond in JSON format with portfolio_analysis, category_recommendations, strategic_insights, and action_priorities.
`

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert alcohol industry consultant specializing in UK market analysis and inventory optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
      
    } catch (error) {
      console.error('Portfolio insights generation failed:', error)
      return {
        portfolio_analysis: 'Portfolio analysis unavailable - check AI service configuration',
        category_recommendations: [],
        strategic_insights: [],
        action_priorities: []
      }
    }
  }

  // System prompt for creative recommendations
  private static getSystemPrompt(): string {
    return `You are an expert alcohol industry commerce consultant specializing in UK retail and distribution. 

Your expertise includes:
- UK alcohol market trends and consumer behavior
- Creative inventory management and promotional strategies
- Cross-category bundling opportunities
- Seasonal alcohol marketing (Christmas, summer festivals, etc.)
- British drinking culture and preferences

Generate creative, actionable recommendations for moving slow inventory. Think like a seasoned alcohol retailer who understands:
- Mystery boxes and curated selections work well in alcohol
- Cross-category bundles (wine + cheese, spirits + mixers)
- Seasonal timing is crucial (Christmas whisky gifts, summer beer promotions)
- British consumers love discovery and value perception

Always consider profit margins, realistic implementation, and UK alcohol regulations.

Respond only in valid JSON format with the structure requested.`
  }

  // Build the main recommendation prompt
  private static buildCreativeRecommendationPrompt(
    inventoryContext: any,
    competitiveContext: any,
    seasonalContext: any
  ): string {
    return `
SLOW-MOVING INVENTORY ANALYSIS:
${JSON.stringify(inventoryContext, null, 2)}

COMPETITIVE LANDSCAPE:
${JSON.stringify(competitiveContext, null, 2)}

SEASONAL CONTEXT:
${JSON.stringify(seasonalContext, null, 2)}

Generate 3-5 creative strategies to move this slow inventory. For each strategy, consider:

1. BUNDLING OPPORTUNITIES: What complementary products could create attractive packages?
2. SEASONAL TIMING: How can we leverage upcoming holidays/seasons?
3. MYSTERY BOXES: Could we create curated discovery experiences?
4. CROSS-CATEGORY APPEAL: How to attract different customer segments?
5. PROFIT OPTIMIZATION: Maintain healthy margins while clearing stock

Focus on strategies that:
- Move significant inventory volumes
- Maintain or improve profit margins  
- Create customer value and excitement
- Are realistic to implement quickly
- Align with UK drinking culture

Respond in JSON with this structure:
{
  "strategies": [
    {
      "strategy_type": "bundle|mystery_box|seasonal_promotion|cross_category|experience|clearance",
      "title": "Short catchy title",
      "description": "Detailed explanation of the strategy",
      "products_involved": ["sku1", "sku2"],
      "pricing_strategy": {
        "individual_total": number,
        "bundle_price": number,
        "discount_percentage": number,
        "profit_margin": number
      },
      "marketing_angle": "How to market this",
      "target_customer": "Who this appeals to",
      "urgency": "immediate|within_week|seasonal|long_term",
      "estimated_impact": {
        "units_moved": number,
        "revenue_recovery": number,
        "inventory_clearance": number
      },
      "implementation_steps": ["step1", "step2", "step3"]
    }
  ]
}`
  }

  // Process GPT-4 response and validate
  private static processGPTRecommendations(
    gptResponse: any,
    slowMovingProducts: SlowMovingProduct[],
    allInventory: AlcoholSKU[]
  ): CreativeRecommendation[] {
    
    if (!gptResponse.strategies || !Array.isArray(gptResponse.strategies)) {
      console.error('Invalid GPT-4 response structure')
      return []
    }

    return gptResponse.strategies
      .filter((strategy: any) => this.validateRecommendation(strategy, slowMovingProducts))
      .map((strategy: any) => ({
        strategy_type: strategy.strategy_type,
        title: strategy.title,
        description: strategy.description,
        products_involved: strategy.products_involved || [],
        pricing_strategy: {
          individual_total: strategy.pricing_strategy?.individual_total || 0,
          bundle_price: strategy.pricing_strategy?.bundle_price || 0,
          discount_percentage: strategy.pricing_strategy?.discount_percentage || 0,
          profit_margin: strategy.pricing_strategy?.profit_margin || 0
        },
        marketing_angle: strategy.marketing_angle || '',
        target_customer: strategy.target_customer || '',
        urgency: strategy.urgency || 'within_week',
        estimated_impact: {
          units_moved: strategy.estimated_impact?.units_moved || 0,
          revenue_recovery: strategy.estimated_impact?.revenue_recovery || 0,
          inventory_clearance: strategy.estimated_impact?.inventory_clearance || 0
        },
        implementation_steps: strategy.implementation_steps || []
      }))
      .slice(0, 5) // Limit to top 5 recommendations
  }

  // Validate recommendation quality
  private static validateRecommendation(strategy: any, slowMovingProducts: SlowMovingProduct[]): boolean {
    return (
      strategy.title && 
      strategy.description && 
      strategy.strategy_type &&
      Array.isArray(strategy.products_involved) &&
      strategy.products_involved.length > 0 &&
      strategy.products_involved.every((sku: string) => 
        slowMovingProducts.some(p => p.sku === sku)
      )
    )
  }

  // Prepare inventory context for GPT-4
  private static prepareInventoryContext(
    slowMovingProducts: SlowMovingProduct[],
    allInventory: AlcoholSKU[]
  ) {
    return {
      slow_moving_count: slowMovingProducts.length,
      total_slow_inventory_value: slowMovingProducts.reduce((sum, p) => sum + (p.inventory_level * p.price), 0),
      categories_affected: [...new Set(slowMovingProducts.map(p => p.category))],
      top_slow_movers: slowMovingProducts
        .sort((a, b) => (b.inventory_level * b.price) - (a.inventory_level * a.price))
        .slice(0, 10)
        .map(p => ({
          sku: p.sku,
          category: p.category,
          brand: p.brand,
          inventory_value: p.inventory_level * p.price,
          weeks_stagnant: p.weeks_since_last_sale
        })),
      available_complement_products: this.findComplementaryProducts(slowMovingProducts, allInventory)
    }
  }

  // Find products that could work well in bundles
  private static findComplementaryProducts(
    slowMovingProducts: SlowMovingProduct[],
    allInventory: AlcoholSKU[]
  ) {
    const fastMovers = allInventory.filter(sku => 
      parseFloat(sku.weekly_sales) > 5 && 
      !slowMovingProducts.some(slow => slow.sku === sku.sku)
    )

    return fastMovers.slice(0, 20).map(sku => ({
      sku: sku.sku,
      category: sku.category,
      brand: sku.brand,
      price: parseFloat(sku.price),
      weekly_sales: parseFloat(sku.weekly_sales)
    }))
  }

  // Prepare competitive context
  private static prepareCompetitiveContext(competitorData: CompetitorPrice[]) {
    if (competitorData.length === 0) return { message: 'No competitor data available' }

    const avgPriceAdvantage = competitorData.reduce((sum, comp) => sum + comp.price_difference_percentage, 0) / competitorData.length

    return {
      competitor_count: competitorData.length,
      avg_price_advantage: Math.round(avgPriceAdvantage * 100) / 100,
      overpriced_products: competitorData.filter(c => c.price_difference_percentage > 10).length,
      underpriced_products: competitorData.filter(c => c.price_difference_percentage < -10).length,
      price_competitive_products: competitorData.filter(c => Math.abs(c.price_difference_percentage) <= 10).length
    }
  }

  // Get current seasonal context
  private static getCurrentSeasonalContext() {
    const now = new Date()
    const month = now.getMonth()
    const day = now.getDate()

    let upcoming_holidays: string[] = []
    let days_to_holiday = 365

    // UK-specific seasonal calendar
    if (month === 10 || (month === 11 && day < 25)) {
      upcoming_holidays.push('Christmas')
      const christmas = new Date(now.getFullYear(), 11, 25)
      days_to_holiday = Math.ceil((christmas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    } else if (month === 11 && day >= 25) {
      upcoming_holidays.push('New Year')
      const newYear = new Date(now.getFullYear() + 1, 0, 1)
      days_to_holiday = Math.ceil((newYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    } else if (month >= 2 && month <= 4) {
      upcoming_holidays.push('Easter', 'Spring Bank Holiday')
      days_to_holiday = 30
    } else if (month >= 5 && month <= 7) {
      upcoming_holidays.push('Summer festivals', 'August Bank Holiday')
      days_to_holiday = 45
    }

    const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter']

    return {
      current_season: seasons[month],
      upcoming_holidays,
      days_to_holiday,
      is_peak_season: month >= 10 || month <= 1, // Nov-Jan is peak for alcohol
      weather_context: month >= 5 && month <= 8 ? 'warm_weather' : 'cold_weather'
    }
  }

  // Analyze portfolio composition
  private static analyzePortfolioComposition(allInventory: AlcoholSKU[]) {
    const byCategory = allInventory.reduce((acc, sku) => {
      const category = sku.category
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          total_value: 0,
          avg_price: 0,
          slow_movers: 0
        }
      }
      acc[category].count++
      acc[category].total_value += parseFloat(sku.price) * parseInt(sku.inventory_level)
      acc[category].slow_movers += parseFloat(sku.weekly_sales) < 1 ? 1 : 0
      return acc
    }, {} as Record<string, any>)

    // Calculate averages
    Object.keys(byCategory).forEach(category => {
      byCategory[category].avg_price = byCategory[category].total_value / byCategory[category].count
      byCategory[category].slow_mover_percentage = (byCategory[category].slow_movers / byCategory[category].count) * 100
    })

    return {
      total_skus: allInventory.length,
      total_portfolio_value: Object.values(byCategory).reduce((sum: any, cat: any) => sum + cat.total_value, 0),
      category_breakdown: byCategory,
      avg_portfolio_price: allInventory.reduce((sum, sku) => sum + parseFloat(sku.price), 0) / allInventory.length
    }
  }

  // Calculate portfolio performance metrics
  private static calculatePortfolioMetrics(allInventory: AlcoholSKU[], salesHistory: any[]) {
    const totalWeeklySales = allInventory.reduce((sum, sku) => sum + parseFloat(sku.weekly_sales), 0)
    const totalInventoryValue = allInventory.reduce((sum, sku) => sum + (parseFloat(sku.price) * parseInt(sku.inventory_level)), 0)
    const slowMovers = allInventory.filter(sku => parseFloat(sku.weekly_sales) < 1).length
    
    return {
      weekly_velocity: totalWeeklySales,
      inventory_turnover: totalWeeklySales > 0 ? (totalInventoryValue / (totalWeeklySales * 52)) : 0,
      slow_mover_percentage: (slowMovers / allInventory.length) * 100,
      avg_margin_estimate: 0.35, // Typical alcohol margin
      cash_tied_up: totalInventoryValue
    }
  }

  // Fallback recommendations if GPT-4 fails
  private static generateFallbackRecommendations(
    slowMovingProducts: SlowMovingProduct[],
    allInventory: AlcoholSKU[],
    seasonalContext?: any
  ): CreativeRecommendation[] {
    const recommendations: CreativeRecommendation[] = []

    // Christmas Mystery Box Strategy
    if (seasonalContext?.upcoming_holidays?.includes('Christmas')) {
      const premiumSlowMovers = slowMovingProducts.filter(p => p.price > 30 && p.category === 'spirits')
      if (premiumSlowMovers.length >= 2) {
        const selectedProducts = premiumSlowMovers.slice(0, 3)
        const totalValue = selectedProducts.reduce((sum, p) => sum + p.price, 0)
        
        recommendations.push({
          strategy_type: 'mystery_box',
          title: 'Premium Christmas Spirits Mystery Box',
          description: `Create a curated Christmas mystery box featuring ${selectedProducts.length} premium spirits. Perfect for gift-giving season and moving high-value slow stock.`,
          products_involved: selectedProducts.map(p => p.sku),
          pricing_strategy: {
            individual_total: totalValue,
            bundle_price: totalValue * 0.75,
            discount_percentage: 25,
            profit_margin: 20
          },
          marketing_angle: 'Exclusive Christmas discovery experience - perfect for whisky enthusiasts',
          target_customer: 'Gift buyers and spirit collectors',
          urgency: 'immediate',
          estimated_impact: {
            units_moved: Math.min(50, selectedProducts.reduce((sum, p) => sum + p.inventory_level, 0) / 3),
            revenue_recovery: totalValue * 0.75 * 15,
            inventory_clearance: 60
          },
          implementation_steps: [
            'Design premium packaging for mystery box',
            'Create marketing campaign emphasizing discovery and value',
            'Set up limited quantity (50 boxes) to create urgency',
            'Include tasting notes and brand stories'
          ]
        })
      }
    }

    // Cross-category bundle for summer
    if (seasonalContext?.current_season === 'summer') {
      const slowBeers = slowMovingProducts.filter(p => p.category === 'beer')
      const slowSpirits = slowMovingProducts.filter(p => p.category === 'spirits' && p.price < 40)
      
      if (slowBeers.length > 0 && slowSpirits.length > 0) {
        recommendations.push({
          strategy_type: 'cross_category',
          title: 'Summer BBQ Bundle',
          description: 'Combine slow-moving beers with mixable spirits for summer entertaining',
          products_involved: [slowBeers[0].sku, slowSpirits[0].sku],
          pricing_strategy: {
            individual_total: slowBeers[0].price + slowSpirits[0].price,
            bundle_price: (slowBeers[0].price + slowSpirits[0].price) * 0.85,
            discount_percentage: 15,
            profit_margin: 25
          },
          marketing_angle: 'Complete summer entertaining solution',
          target_customer: 'BBQ hosts and summer party planners',
          urgency: 'seasonal',
          estimated_impact: {
            units_moved: 30,
            revenue_recovery: (slowBeers[0].price + slowSpirits[0].price) * 0.85 * 30,
            inventory_clearance: 40
          },
          implementation_steps: [
            'Create summer-themed packaging',
            'Include cocktail recipe cards',
            'Partner with BBQ supply stores',
            'Social media summer content'
          ]
        })
      }
    }

    return recommendations
  }

  // Generate pricing optimization recommendations
  static async generatePricingOptimization(
    alcoholSKU: AlcoholSKU,
    competitorPrices: CompetitorPrice[],
    salesHistory: any[] = []
  ): Promise<{
    current_analysis: string
    pricing_opportunities: string[]
    risk_assessment: string
    recommended_actions: { action: string, timeline: string, expected_impact: string }[]
  }> {
    
    try {
      const client = await this.getOpenAIClient()
      
      const competitivePosition = this.analyzeCompetitivePosition(alcoholSKU, competitorPrices)
      const salesTrend = this.analyzeSalesTrend(salesHistory)
      
      const prompt = `
Analyze pricing strategy for this UK alcohol product:

PRODUCT: ${alcoholSKU.sku}
Category: ${alcoholSKU.category}
Brand: ${alcoholSKU.brand}
Current Price: £${alcoholSKU.price}
Weekly Sales: ${alcoholSKU.weekly_sales}
Inventory: ${alcoholSKU.inventory_level}

COMPETITIVE POSITION:
${JSON.stringify(competitivePosition, null, 2)}

SALES TREND:
${JSON.stringify(salesTrend, null, 2)}

Provide specific pricing recommendations considering:
1. UK alcohol market dynamics
2. Competitive positioning
3. Inventory turnover needs
4. Profit margin optimization
5. Customer price sensitivity for this category

Response format: JSON with current_analysis, pricing_opportunities, risk_assessment, recommended_actions
`

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a UK alcohol industry pricing specialist with deep knowledge of consumer behavior and competitive dynamics.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
      
    } catch (error) {
      console.error('Pricing optimization failed:', error)
      return {
        current_analysis: 'Pricing analysis unavailable',
        pricing_opportunities: [],
        risk_assessment: 'Unable to assess pricing risk',
        recommended_actions: []
      }
    }
  }

  private static analyzeCompetitivePosition(alcoholSKU: AlcoholSKU, competitorPrices: CompetitorPrice[]) {
    if (competitorPrices.length === 0) return { message: 'No competitor data available' }

    const ourPrice = parseFloat(alcoholSKU.price)
    const competitorList = competitorPrices.map(c => ({
      retailer: c.competitor,
      price: c.competitor_price,
      difference: c.price_difference_percentage
    }))

    const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
    const pricePosition = ourPrice > avgCompPrice ? 'premium' : ourPrice < avgCompPrice * 0.9 ? 'value' : 'competitive'

    return {
      our_price: ourPrice,
      competitor_average: avgCompPrice,
      price_position: pricePosition,
      competitors: competitorList,
      market_spread: {
        lowest: Math.min(...competitorPrices.map(c => c.competitor_price)),
        highest: Math.max(...competitorPrices.map(c => c.competitor_price))
      }
    }
  }

  private static analyzeSalesTrend(salesHistory: any[]) {
    if (salesHistory.length < 4) return { trend: 'insufficient_data' }

    const recentWeeks = salesHistory.slice(-4).map(h => h.sales || h.weekly_sales || 0)
    const olderWeeks = salesHistory.slice(-8, -4).map(h => h.sales || h.weekly_sales || 0)

    const recentAvg = recentWeeks.reduce((a, b) => a + b, 0) / recentWeeks.length
    const olderAvg = olderWeeks.length > 0 ? olderWeeks.reduce((a, b) => a + b, 0) / olderWeeks.length : recentAvg

    const trendPercentage = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0

    return {
      trend: trendPercentage > 10 ? 'improving' : trendPercentage < -10 ? 'declining' : 'stable',
      trend_percentage: Math.round(trendPercentage),
      recent_average: recentAvg,
      momentum: recentWeeks[3] > recentWeeks[0] ? 'positive' : 'negative'
    }
  }

  // Generate seasonal marketing recommendations
  static async generateSeasonalMarketing(
    category: string,
    slowMovingProducts: SlowMovingProduct[],
    daysToHoliday: number
  ): Promise<{
    campaigns: { title: string, description: string, products: string[], timeline: string }[]
    content_ideas: string[]
    promotional_strategies: string[]
  }> {
    
    try {
      const client = await this.getOpenAIClient()
      
      const prompt = `
Create seasonal marketing strategies for UK alcohol retailer:

CATEGORY: ${category}
DAYS TO NEXT HOLIDAY: ${daysToHoliday}
SLOW INVENTORY: ${slowMovingProducts.length} products worth £${slowMovingProducts.reduce((sum, p) => sum + (p.inventory_level * p.price), 0)}

Generate UK-specific marketing campaigns that:
1. Move slow inventory before holiday season
2. Appeal to British drinking culture
3. Create urgency and value perception
4. Work across different customer segments

Focus on practical campaigns that can be implemented quickly.

Response format: JSON with campaigns, content_ideas, promotional_strategies
`

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a UK alcohol marketing specialist with expertise in British consumer behavior and seasonal trends.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      })

      return JSON.parse(response.choices[0].message.content || '{}')
      
    } catch (error) {
      console.error('Seasonal marketing generation failed:', error)
      return {
        campaigns: [],
        content_ideas: [],
        promotional_strategies: []
      }
    }
  }

  // Cost optimization: Batch multiple SKUs in single GPT-4 call
  static async batchAnalyzeInventoryStrategies(
    inventoryBatches: SlowMovingProduct[][],
    allInventory: AlcoholSKU[],
    maxBatchSize: number = 10
  ): Promise<CreativeRecommendation[]> {
    const allRecommendations: CreativeRecommendation[] = []

    for (let i = 0; i < inventoryBatches.length; i += maxBatchSize) {
      const batch = inventoryBatches.slice(i, i + maxBatchSize)
      const flatBatch = batch.flat()
      
      try {
        const batchRecommendations = await this.generateCreativeRecommendations(
          flatBatch,
          allInventory
        )
        allRecommendations.push(...batchRecommendations)
        
        // Rate limiting to avoid OpenAI limits
        await this.delay(1000)
        
      } catch (error) {
        console.error(`Batch ${i} failed:`, error)
      }
    }

    return allRecommendations
  }

  // Utility delay function
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Calculate GPT-4 token costs for budgeting
  static estimateTokenCosts(
    totalSKUs: number,
    avgSKUsPerRequest: number = 10
  ): {
    estimated_requests: number
    estimated_tokens: number
    estimated_cost_usd: number
  } {
    const requests = Math.ceil(totalSKUs / avgSKUsPerRequest)
    const avgTokensPerRequest = 800 // Prompt + response
    const totalTokens = requests * avgTokensPerRequest
    const costPerToken = 0.00003 // GPT-4 turbo pricing
    
    return {
      estimated_requests: requests,
      estimated_tokens: totalTokens,
      estimated_cost_usd: totalTokens * costPerToken
    }
  }
}
// NEW FILE: /src/lib/competitor-intelligence.ts
// Competitive Intelligence Service for Alcohol Industry

import { CompetitorPrice, MarketTrend, AlcoholSKU } from '@/types'

export interface CompetitorSource {
  id: string
  name: string
  type: 'retailer' | 'distributor' | 'manufacturer' | 'marketplace'
  base_url: string
  scraping_config?: {
    price_selector: string
    availability_selector: string
    product_title_selector: string
    rate_limit_ms: number
  }
  api_config?: {
    endpoint: string
    api_key?: string
    headers?: Record<string, string>
  }
  enabled: boolean
  last_updated?: Date
}

export interface PriceComparisonResult {
  sku: string
  our_price: number
  competitor_prices: CompetitorPrice[]
  market_position: {
    rank: number // 1 = cheapest
    percentile: number // 0-100, where 0 = cheapest
    price_advantage: number // percentage difference from average
  }
  recommendations: {
    action: 'maintain' | 'increase' | 'decrease' | 'investigate'
    target_price?: number
    reasoning: string
    urgency: 'low' | 'medium' | 'high'
  }
}

export interface MarketIntelligenceReport {
  generated_at: Date
  category: string
  time_period: 'daily' | 'weekly' | 'monthly'
  price_trends: {
    average_price_change: number
    price_volatility: number
    trending_up: string[] // SKUs with rising prices
    trending_down: string[] // SKUs with falling prices
  }
  new_products: {
    sku: string
    brand: string
    subcategory: string
    launch_price: number
    threat_level: 'low' | 'medium' | 'high'
  }[]
  market_gaps: {
    price_range: { min: number, max: number }
    subcategory: string
    opportunity_score: number
  }[]
}

export class CompetitorIntelligenceService {
  private static COMPETITOR_SOURCES: CompetitorSource[] = [
    {
      id: 'total_wine',
      name: 'Total Wine & More',
      type: 'retailer',
      base_url: 'https://www.totalwine.com',
      scraping_config: {
        price_selector: '.price-current',
        availability_selector: '.availability-status',
        product_title_selector: '.product-title',
        rate_limit_ms: 2000
      },
      enabled: true
    },
    {
      id: 'wine_com',
      name: 'Wine.com',
      type: 'marketplace',
      base_url: 'https://www.wine.com',
      scraping_config: {
        price_selector: '.price-value',
        availability_selector: '.stock-status',
        product_title_selector: '.wine-title',
        rate_limit_ms: 1500
      },
      enabled: true
    },
    {
      id: 'bevmo',
      name: 'BevMo!',
      type: 'retailer',
      base_url: 'https://www.bevmo.com',
      scraping_config: {
        price_selector: '.price-now',
        availability_selector: '.product-availability',
        product_title_selector: '.product-name',
        rate_limit_ms: 2500
      },
      enabled: true
    },
    {
      id: 'drizly',
      name: 'Drizly',
      type: 'marketplace',
      base_url: 'https://drizly.com',
      scraping_config: {
        price_selector: '.price-display',
        availability_selector: '.delivery-info',
        product_title_selector: '.product-title',
        rate_limit_ms: 3000
      },
      enabled: true
    }
  ]

  // Main method to fetch competitor pricing
  static async fetchCompetitorPrices(
    alcoholSKU: AlcoholSKU,
    sources: string[] = ['total_wine', 'wine_com', 'bevmo']
  ): Promise<CompetitorPrice[]> {
    const results: CompetitorPrice[] = []
    
    for (const sourceId of sources) {
      const source = this.COMPETITOR_SOURCES.find(s => s.id === sourceId)
      if (!source || !source.enabled) continue
      
      try {
        const price = await this.scrapeProductPrice(source, alcoholSKU)
        if (price) {
          results.push(price)
        }
      } catch (error) {
        console.error(`Failed to fetch price from ${source.name}:`, error)
      }
      
      // Respect rate limits
      await this.delay(source.scraping_config?.rate_limit_ms || 2000)
    }
    
    return results
  }

  // Simulate web scraping (in production, use actual scraping libraries)
  private static async scrapeProductPrice(
    source: CompetitorSource,
    alcoholSKU: AlcoholSKU
  ): Promise<CompetitorPrice | null> {
    // In production, this would use libraries like Puppeteer, Playwright, or Cheerio
    // For demo purposes, we'll simulate realistic competitor prices
    
    const basePrice = parseFloat(alcoholSKU.price)
    const variation = (Math.random() - 0.5) * 0.3 // ±15% variation
    const competitorPrice = basePrice * (1 + variation)
    
    // Simulate some sources not having the product
    if (Math.random() < 0.2) return null // 20% chance not available
    
    return {
      sku: alcoholSKU.sku,
      competitor: source.name,
      competitor_price: Math.round(competitorPrice * 100) / 100,
      our_price: basePrice,
      price_difference: competitorPrice - basePrice,
      price_difference_percentage: ((competitorPrice - basePrice) / basePrice) * 100,
      availability: Math.random() > 0.1, // 90% availability rate
      last_updated: new Date(),
      source: source.id as any,
      url: `${source.base_url}/search?q=${encodeURIComponent(alcoholSKU.brand + ' ' + alcoholSKU.subcategory)}`,
      promotional: Math.random() < 0.15, // 15% chance of promotion
      promotion_details: Math.random() < 0.15 ? '15% off this week' : undefined
    }
  }

  // Batch price comparison for multiple SKUs
  static async batchPriceComparison(
    alcoholSKUs: AlcoholSKU[],
    sources: string[] = ['total_wine', 'wine_com', 'bevmo']
  ): Promise<PriceComparisonResult[]> {
    const results: PriceComparisonResult[] = []
    
    for (const sku of alcoholSKUs) {
      const competitorPrices = await this.fetchCompetitorPrices(sku, sources)
      const comparison = this.analyzePricePosition(sku, competitorPrices)
      results.push(comparison)
      
      // Rate limiting between SKUs
      await this.delay(1000)
    }
    
    return results
  }

  // Analyze competitive price position
  private static analyzePricePosition(
    alcoholSKU: AlcoholSKU,
    competitorPrices: CompetitorPrice[]
  ): PriceComparisonResult {
    const ourPrice = parseFloat(alcoholSKU.price)
    
    if (competitorPrices.length === 0) {
      return {
        sku: alcoholSKU.sku,
        our_price: ourPrice,
        competitor_prices: [],
        market_position: {
          rank: 1,
          percentile: 50,
          price_advantage: 0
        },
        recommendations: {
          action: 'investigate',
          reasoning: 'No competitor data available - consider market research',
          urgency: 'medium'
        }
      }
    }
    
    const allPrices = [ourPrice, ...competitorPrices.map(c => c.competitor_price)].sort((a, b) => a - b)
    const ourRank = allPrices.indexOf(ourPrice) + 1
    const percentile = ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100
    
    const avgCompetitorPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
    const priceAdvantage = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100
    
    // Generate recommendations
    let action: 'maintain' | 'increase' | 'decrease' | 'investigate' = 'maintain'
    let targetPrice: number | undefined
    let reasoning = ''
    let urgency: 'low' | 'medium' | 'high' = 'low'
    
    if (priceAdvantage > 20) {
      action = 'decrease'
      targetPrice = avgCompetitorPrice * 1.05 // 5% above average
      reasoning = 'Significantly overpriced vs competitors - risk of lost sales'
      urgency = 'high'
    } else if (priceAdvantage > 10) {
      action = 'decrease'
      targetPrice = avgCompetitorPrice * 1.03 // 3% above average
      reasoning = 'Moderately overpriced - consider small price reduction'
      urgency = 'medium'
    } else if (priceAdvantage < -15 && alcoholSKU.category === 'spirits') {
      action = 'increase'
      targetPrice = avgCompetitorPrice * 0.98 // 2% below average
      reasoning = 'Underpriced premium spirits - pricing power opportunity'
      urgency = 'medium'
    } else if (priceAdvantage < -10) {
      action = 'increase'
      targetPrice = avgCompetitorPrice * 0.95 // 5% below average
      reasoning = 'Underpriced vs market - gradual price increase recommended'
      urgency = 'low'
    } else {
      reasoning = 'Competitively positioned - monitor for changes'
    }
    
    return {
      sku: alcoholSKU.sku,
      our_price: ourPrice,
      competitor_prices: competitorPrices,
      market_position: {
        rank: ourRank,
        percentile: Math.round(percentile),
        price_advantage: Math.round(priceAdvantage * 100) / 100
      },
      recommendations: {
        action,
        target_price: targetPrice,
        reasoning,
        urgency
      }
    }
  }

  // Monitor for new product launches
  static async detectNewProducts(category: string): Promise<MarketIntelligenceReport['new_products']> {
    // In production, this would monitor industry news, distributor catalogs, etc.
    // Simulated new product detection
    
    const newProducts = [
      {
        sku: 'NEW-CRAFT-IPA-001',
        brand: 'Emerging Brewery Co.',
        subcategory: 'Hazy IPA',
        launch_price: 12.99,
        threat_level: 'medium' as const
      },
      {
        sku: 'NEW-PREMIUM-WHISKEY-001',
        brand: 'Artisan Distillery',
        subcategory: 'Single Barrel Bourbon',
        launch_price: 89.99,
        threat_level: 'low' as const
      }
    ]
    
    return newProducts.filter(p => 
      category === 'all' || 
      (category === 'beer' && p.subcategory.includes('IPA')) ||
      (category === 'spirits' && p.subcategory.includes('Bourbon'))
    )
  }

  // Generate market intelligence report
  static async generateMarketReport(
    category: string,
    timePeriod: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<MarketIntelligenceReport> {
    
    // In production, this would aggregate data from multiple sources
    return {
      generated_at: new Date(),
      category,
      time_period: timePeriod,
      price_trends: {
        average_price_change: category === 'beer' ? -1.2 : category === 'spirits' ? 2.3 : 0.8,
        price_volatility: category === 'wine' ? 15.6 : 8.2,
        trending_up: ['PREMIUM-VODKA-001', 'CRAFT-WHISKEY-002'],
        trending_down: ['LIGHT-BEER-001', 'MASS-WINE-001']
      },
      new_products: await this.detectNewProducts(category),
      market_gaps: [
        {
          price_range: { min: 25, max: 35 },
          subcategory: 'Premium Lager',
          opportunity_score: 85
        },
        {
          price_range: { min: 60, max: 80 },
          subcategory: 'Aged Rum',
          opportunity_score: 72
        }
      ]
    }
  }

  // Real-time price monitoring
  static async startPriceMonitoring(
    skus: string[],
    checkIntervalMinutes: number = 60
  ): Promise<void> {
    console.log(`Starting price monitoring for ${skus.length} SKUs`)
    console.log(`Check interval: ${checkIntervalMinutes} minutes`)
    
    // In production, this would set up scheduled jobs
    setInterval(async () => {
      for (const sku of skus) {
        try {
          // Mock monitoring - would fetch real prices
          console.log(`Checking prices for ${sku}...`)
          
          // If significant price change detected, trigger alert
          const priceChangeDetected = Math.random() < 0.1 // 10% chance
          if (priceChangeDetected) {
            console.log(`🚨 Price change detected for ${sku}`)
            // Trigger alert system
          }
        } catch (error) {
          console.error(`Price monitoring error for ${sku}:`, error)
        }
      }
    }, checkIntervalMinutes * 60 * 1000)
  }

  // Utility method for delays
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Search for products by UPC or brand name
  static async searchCompetitorProducts(
    searchTerm: string,
    category?: string
  ): Promise<CompetitorPrice[]> {
    const results: CompetitorPrice[] = []
    
    // Simulate search across multiple competitor sources
    for (const source of this.COMPETITOR_SOURCES.filter(s => s.enabled)) {
      try {
        // In production, would perform actual search
        const searchResults = await this.simulateProductSearch(source, searchTerm, category)
        results.push(...searchResults)
      } catch (error) {
        console.error(`Search failed on ${source.name}:`, error)
      }
      
      await this.delay(source.scraping_config?.rate_limit_ms || 2000)
    }
    
    return results
  }

  private static async simulateProductSearch(
    source: CompetitorSource,
    searchTerm: string,
    category?: string
  ): Promise<CompetitorPrice[]> {
    // Simulate finding products matching search term
    const mockResults: CompetitorPrice[] = []
    
    // Generate 1-3 mock results per source
    const resultCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < resultCount; i++) {
      const basePrice = 15 + Math.random() * 85 // $15-$100 range
      mockResults.push({
        sku: `FOUND-${searchTerm.replace(/\s+/g, '-').toUpperCase()}-${i + 1}`,
        competitor: source.name,
        competitor_price: Math.round(basePrice * 100) / 100,
        our_price: 0, // Unknown for search results
        price_difference: 0,
        price_difference_percentage: 0,
        availability: true,
        last_updated: new Date(),
        source: source.id as any,
        url: `${source.base_url}/search?q=${encodeURIComponent(searchTerm)}`
      })
    }
    
    return mockResults
  }
}
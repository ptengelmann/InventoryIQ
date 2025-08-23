// /src/lib/enhanced-mock-data.ts
// Market-intelligent mock data generator using real alcohol industry knowledge

import { CompetitorPrice } from '@/types'
import { AlcoholMarketIntelligence } from './alcohol-market-intelligence'

interface EnhancedCompetitorData extends CompetitorPrice {
  market_context: {
    brand_tier: string
    typical_margin: number
    seasonal_factor: number
    competitive_intensity: number
  }
}

// UK Alcohol Retailer Profiles with Realistic Pricing Strategies
const UK_RETAILER_PROFILES = {
  majestic: {
    name: 'Majestic Wine',
    positioning: 'premium_specialist',
    price_strategy: 'value_premium', // Good quality at fair prices
    markup_range: { min: 1.15, max: 1.35 },
    category_focus: ['wine', 'champagne', 'premium_spirits'],
    availability_rate: 0.85,
    promotional_frequency: 0.25,
    expertise_level: 'high'
  },
  waitrose: {
    name: 'Waitrose',
    positioning: 'premium_supermarket',
    price_strategy: 'quality_premium',
    markup_range: { min: 1.20, max: 1.45 },
    category_focus: ['wine', 'premium_spirits', 'craft_beer'],
    availability_rate: 0.92,
    promotional_frequency: 0.15,
    expertise_level: 'medium'
  },
  tesco: {
    name: 'Tesco',
    positioning: 'mainstream_volume',
    price_strategy: 'competitive_mainstream',
    markup_range: { min: 1.05, max: 1.25 },
    category_focus: ['mainstream_brands', 'own_label'],
    availability_rate: 0.88,
    promotional_frequency: 0.35,
    expertise_level: 'medium'
  },
  asda: {
    name: 'ASDA',
    positioning: 'value_focused',
    price_strategy: 'everyday_low_price',
    markup_range: { min: 1.02, max: 1.18 },
    category_focus: ['value_brands', 'bulk_sizes'],
    availability_rate: 0.82,
    promotional_frequency: 0.40,
    expertise_level: 'low'
  },
  morrisons: {
    name: 'Morrisons',
    positioning: 'family_value',
    price_strategy: 'competitive_value',
    markup_range: { min: 1.08, max: 1.22 },
    category_focus: ['family_brands', 'regional_preferences'],
    availability_rate: 0.80,
    promotional_frequency: 0.30,
    expertise_level: 'medium'
  },
  amazon: {
    name: 'Amazon',
    positioning: 'convenience_platform',
    price_strategy: 'dynamic_competitive',
    markup_range: { min: 1.10, max: 1.30 },
    category_focus: ['convenience', 'bulk_buying', 'subscriptions'],
    availability_rate: 0.75,
    promotional_frequency: 0.20,
    expertise_level: 'low'
  }
}

export class EnhancedMockDataGenerator {
  
  // Generate market-intelligent competitor pricing
  static async generateIntelligentCompetitorPrices(
    productName: string,
    category: string = 'alcohol',
    targetRetailers: string[] = ['majestic', 'waitrose', 'tesco', 'asda']
  ): Promise<EnhancedCompetitorData[]> {
    
    // First, try to identify the actual product
    const productMatch = AlcoholMarketIntelligence.findBestProductMatch(productName)
    
    if (!productMatch.brand || productMatch.confidence < 0.3) {
      // Fallback to category-based pricing
      return this.generateCategoryBasedPricing(productName, category, targetRetailers)
    }
    
    const { brand, confidence } = productMatch
    const results: EnhancedCompetitorData[] = []
    
    // Generate realistic pricing for each retailer based on their strategy
    for (const retailerId of targetRetailers) {
      const retailer = UK_RETAILER_PROFILES[retailerId as keyof typeof UK_RETAILER_PROFILES]
      if (!retailer) continue
      
      // Calculate base price using brand's typical range
      const brandMidPrice = (brand.typical_price_range.min + brand.typical_price_range.max) / 2
      
      // Apply retailer-specific pricing strategy
      const retailerPrice = this.calculateRetailerPrice(brandMidPrice, retailer, brand, category)
      
      // Check availability based on retailer's category focus
      const isAvailable = this.checkRetailerAvailability(retailer, brand, category)
      
      if (isAvailable) {
        results.push({
          sku: `${retailerId.toUpperCase()}-${brand.id.toUpperCase()}`,
          competitor: retailer.name,
          competitor_price: Math.round(retailerPrice * 100) / 100,
          our_price: 0, // Will be set by caller
          price_difference: 0,
          price_difference_percentage: 0,
          availability: true,
          last_updated: new Date(),
          source: retailerId as any,
          url: `https://www.${retailerId}.com/search?q=${encodeURIComponent(productName)}`,
          promotional: Math.random() < retailer.promotional_frequency,
          promotion_details: Math.random() < retailer.promotional_frequency ? 
            this.generatePromotionDetails(retailer, brand) : undefined,
          product_name: this.generateRealisticProductName(brand, retailer),
          relevance_score: confidence,
          market_context: {
            brand_tier: brand.premium_tier,
            typical_margin: this.calculateTypicalMargin(retailer, brand),
            seasonal_factor: this.getSeasonalFactor(brand.category),
            competitive_intensity: this.getCompetitiveIntensity(brand.category)
          }
        })
      }
    }
    
    return results.sort((a, b) => a.competitor_price - b.competitor_price)
  }
  
  // Calculate realistic retailer pricing based on strategy and brand
  private static calculateRetailerPrice(
    brandMidPrice: number,
    retailer: any,
    brand: any,
    category: string
  ): number {
    let basePrice = brandMidPrice
    
    // Apply retailer markup strategy
    const markupMultiplier = retailer.markup_range.min + 
      Math.random() * (retailer.markup_range.max - retailer.markup_range.min)
    
    // Adjust for brand premium tier
    const tierMultipliers = {
      'value': 0.85,
      'mainstream': 1.0,
      'premium': 1.15,
      'super_premium': 1.35,
      'ultra_premium': 1.65
    }
    const tierMultiplier = tierMultipliers[brand.premium_tier as keyof typeof tierMultipliers] || 1.0
    
    // Category-specific adjustments
    const categoryMultipliers = {
      'spirits': 1.1,
      'wine': 1.05,
      'beer': 0.95,
      'champagne': 1.2
    }
    const categoryMultiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || 1.0
    
    // Seasonal adjustments
    const seasonalMultiplier = this.getSeasonalFactor(category)
    
    // Competitive pressure adjustments
    const competitivePressure = this.getCompetitiveIntensity(category)
    const competitiveMultiplier = 1 - (competitivePressure * 0.1) // Higher competition = lower prices
    
    basePrice = basePrice * markupMultiplier * tierMultiplier * categoryMultiplier * seasonalMultiplier * competitiveMultiplier
    
    // Add some realistic variance
    const variance = 0.95 + (Math.random() * 0.1) // ±5% variance
    
    return Math.max(brand.typical_price_range.min * 0.8, basePrice * variance)
  }
  
  // Check if retailer would stock this product
  private static checkRetailerAvailability(retailer: any, brand: any, category: string): boolean {
    // Base availability rate
    let availability = retailer.availability_rate
    
    // Adjust for category focus
    if (retailer.category_focus.includes(category) || 
        retailer.category_focus.includes(brand.category) ||
        retailer.category_focus.includes(brand.subcategory)) {
      availability += 0.15
    }
    
    // Premium retailers less likely to stock value brands
    if (retailer.positioning.includes('premium') && brand.premium_tier === 'value') {
      availability -= 0.3
    }
    
    // Value retailers less likely to stock ultra-premium
    if (retailer.positioning.includes('value') && brand.premium_tier === 'ultra_premium') {
      availability -= 0.4
    }
    
    return Math.random() < Math.min(0.95, Math.max(0.1, availability))
  }
  
  // Generate realistic product names as they would appear on retailer sites
  private static generateRealisticProductName(brand: any, retailer: any): string {
    const variations = [
      `${brand.name}`,
      `${brand.name} - ${retailer.name} Selection`,
      `${brand.name} ${brand.volume_sizes[0]}ml`,
      `${brand.parent_company} ${brand.name}`,
      `${brand.name} - Premium ${brand.category}`
    ]
    
    // Add vintage year for wine
    if (brand.category === 'wine') {
      const currentYear = new Date().getFullYear()
      const vintageYear = currentYear - Math.floor(Math.random() * 5) - 1
      variations.push(`${brand.name} ${vintageYear}`)
    }
    
    // Add age statement for whisky
    if (brand.subcategory === 'single_malt_whisky' || brand.subcategory === 'blended_whisky') {
      const ages = [12, 15, 18, 21, 25]
      const age = ages[Math.floor(Math.random() * ages.length)]
      variations.push(`${brand.name} ${age} Year Old`)
    }
    
    return variations[Math.floor(Math.random() * variations.length)]
  }
  
  // Generate realistic promotion details
  private static generatePromotionDetails(retailer: any, brand: any): string {
    const promotions = [
      '15% off this week',
      '2 for £30',
      'Was £45, Now £38',
      'Special offer - Limited time',
      'Member exclusive price',
      'Buy 2 get 10% off',
      'Weekend special offer'
    ]
    
    // Premium retailers have more sophisticated promotions
    if (retailer.positioning.includes('premium')) {
      promotions.push(
        'Exclusive tasting notes included',
        'Free gift with purchase',
        'Limited edition packaging'
      )
    }
    
    return promotions[Math.floor(Math.random() * promotions.length)]
  }
  
  // Calculate typical retailer margin for brand/category
  private static calculateTypicalMargin(retailer: any, brand: any): number {
    const baseMargin = {
      'spirits': 45,
      'wine': 50,
      'beer': 35,
      'champagne': 55
    }
    
    let margin = baseMargin[brand.category as keyof typeof baseMargin] || 40
    
    // Premium retailers typically have higher margins
    if (retailer.positioning.includes('premium')) {
      margin += 10
    }
    
    // Value retailers work on lower margins
    if (retailer.positioning.includes('value')) {
      margin -= 8
    }
    
    return margin
  }
  
  // Get seasonal pricing factor
  private static getSeasonalFactor(category: string): number {
    const month = new Date().getMonth() + 1
    
    const seasonalFactors = {
      'spirits': {
        1: 1.1, 2: 0.9, 3: 0.95, 4: 1.0, 5: 1.0, 6: 1.05,
        7: 1.05, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.3
      },
      'wine': {
        1: 1.05, 2: 0.95, 3: 1.0, 4: 1.05, 5: 1.1, 6: 1.15,
        7: 1.15, 8: 1.1, 9: 1.05, 10: 1.1, 11: 1.15, 12: 1.25
      },
      'beer': {
        1: 0.85, 2: 0.8, 3: 0.9, 4: 1.05, 5: 1.15, 6: 1.25,
        7: 1.35, 8: 1.3, 9: 1.1, 10: 1.0, 11: 0.95, 12: 1.05
      }
    }
    
    const factors = seasonalFactors[category as keyof typeof seasonalFactors]
    return factors ? factors[month as keyof typeof factors] : 1.0
  }
  
  // Get competitive intensity score
  private static getCompetitiveIntensity(category: string): number {
    const intensityScores = {
      'gin': 0.85,      // Very competitive
      'beer': 0.75,     // High competition
      'wine': 0.65,     // Medium-high competition
      'whisky': 0.45,   // Lower competition (brand loyalty)
      'vodka': 0.80,    // High competition
      'rum': 0.55       // Medium competition
    }
    
    return intensityScores[category as keyof typeof intensityScores] || 0.60
  }
  
  // Fallback method for unknown products
  private static async generateCategoryBasedPricing(
    productName: string,
    category: string,
    retailers: string[]
  ): Promise<EnhancedCompetitorData[]> {
    
    // Infer price range from category
    const categoryPriceRanges = {
      'spirits': { min: 15, max: 80 },
      'wine': { min: 8, max: 40 },
      'beer': { min: 1.5, max: 6 },
      'gin': { min: 18, max: 50 },
      'whisky': { min: 25, max: 120 },
      'vodka': { min: 12, max: 45 }
    }
    
    const priceRange = categoryPriceRanges[category as keyof typeof categoryPriceRanges] || 
                      categoryPriceRanges.spirits
    
    const basePrice = priceRange.min + (Math.random() * (priceRange.max - priceRange.min))
    
    const results: EnhancedCompetitorData[] = []
    
    for (const retailerId of retailers) {
      const retailer = UK_RETAILER_PROFILES[retailerId as keyof typeof UK_RETAILER_PROFILES]
      if (!retailer || Math.random() > retailer.availability_rate) continue
      
      const markup = retailer.markup_range.min + 
        Math.random() * (retailer.markup_range.max - retailer.markup_range.min)
      
      const price = basePrice * markup * this.getSeasonalFactor(category)
      
      results.push({
        sku: `${retailerId.toUpperCase()}-UNKNOWN-${Date.now()}`,
        competitor: retailer.name,
        competitor_price: Math.round(price * 100) / 100,
        our_price: 0,
        price_difference: 0,
        price_difference_percentage: 0,
        availability: true,
        last_updated: new Date(),
        source: retailerId as any,
        url: `https://www.${retailerId}.com/search?q=${encodeURIComponent(productName)}`,
        promotional: Math.random() < retailer.promotional_frequency,
        product_name: `${productName} - ${retailer.name}`,
        relevance_score: 0.3,
        market_context: {
          brand_tier: 'mainstream',
          typical_margin: 40,
          seasonal_factor: this.getSeasonalFactor(category),
          competitive_intensity: 0.6
        }
      })
    }
    
    return results
  }
}
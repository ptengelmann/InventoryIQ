// /src/lib/alcohol-market-intelligence.ts
// Comprehensive UK Alcohol Market Intelligence Database

import { AlcoholSKU, CompetitorPrice } from '@/types'

export interface AlcoholBrand {
  id: string
  name: string
  parent_company: string
  category: string
  subcategory: string
  premium_tier: 'value' | 'mainstream' | 'premium' | 'super_premium' | 'ultra_premium'
  typical_price_range: { min: number, max: number, currency: string }
  market_share_uk: number
  brand_strength: 'declining' | 'stable' | 'growing' | 'emerging'
  seasonal_peaks: string[]
  target_demographics: string[]
  distribution_channels: string[]
  key_competitors: string[]
  usp: string
  abv_range: { min: number, max: number }
  volume_sizes: number[]
  launch_year?: number
  origin_country: string
  keywords: string[] // For matching uploaded SKUs
}

export interface AlcoholCategory {
  category: string
  subcategories: string[]
  uk_market_size_gbp: number
  annual_growth_rate: number
  seasonal_index: { [month: string]: number }
  average_margin: number
  typical_abv_range: { min: number, max: number }
  shelf_life_months: number
  storage_requirements: string
  regulatory_notes: string[]
  emerging_trends: string[]
  price_elasticity: number
  consumer_behavior_notes: string[]
}

export interface MarketIntelligence {
  segment_name: string
  price_range: { min: number, max: number }
  volume_share_percent: number
  value_share_percent: number
  growth_trajectory: number
  key_drivers: string[]
  threat_level: 'low' | 'medium' | 'high'
  opportunity_score: number
  competitive_intensity: number
  barriers_to_entry: string[]
}

export interface CompetitiveStrategy {
  strategy_type: 'price_leadership' | 'differentiation' | 'focus_niche' | 'premium_positioning'
  description: string
  success_factors: string[]
  risk_factors: string[]
  investment_required: 'low' | 'medium' | 'high'
  time_to_impact: 'weeks' | 'months' | 'years'
  examples: string[]
}

export class AlcoholMarketIntelligence {
  
  // Comprehensive UK alcohol brand database
  private static BRAND_DATABASE: AlcoholBrand[] = [
    // PREMIUM SPIRITS - Whisky
    {
      id: 'macallan',
      name: 'The Macallan',
      parent_company: 'Edrington Group',
      category: 'spirits',
      subcategory: 'single_malt_whisky',
      premium_tier: 'super_premium',
      typical_price_range: { min: 65, max: 500, currency: 'GBP' },
      market_share_uk: 3.2,
      brand_strength: 'stable',
      seasonal_peaks: ['christmas', 'fathers_day', 'chinese_new_year'],
      target_demographics: ['affluent_males_35_plus', 'whisky_collectors', 'gift_buyers'],
      distribution_channels: ['premium_off_trade', 'on_trade', 'duty_free'],
      key_competitors: ['glenfiddich', 'glenlivet', 'johnnie_walker_blue'],
      usp: 'Sherry oak maturation heritage and collector appeal',
      abv_range: { min: 40, max: 48 },
      volume_sizes: [700, 750, 1000],
      launch_year: 1824,
      origin_country: 'Scotland',
      keywords: ['macallan', 'mac', 'sherry', 'oak', 'single', 'malt', '12', '18', '25']
    },
    {
      id: 'glenfiddich',
      name: 'Glenfiddich',
      parent_company: 'William Grant & Sons',
      category: 'spirits',
      subcategory: 'single_malt_whisky',
      premium_tier: 'premium',
      typical_price_range: { min: 35, max: 200, currency: 'GBP' },
      market_share_uk: 4.8,
      brand_strength: 'stable',
      seasonal_peaks: ['christmas', 'burns_night'],
      target_demographics: ['whisky_enthusiasts', 'gift_buyers', 'males_30_plus'],
      distribution_channels: ['supermarkets', 'off_trade', 'on_trade'],
      key_competitors: ['glenlivet', 'macallan', 'johnnie_walker'],
      usp: 'World\'s most awarded single malt',
      abv_range: { min: 40, max: 50 },
      volume_sizes: [700, 750, 1000],
      launch_year: 1887,
      origin_country: 'Scotland',
      keywords: ['glenfiddich', 'glen', 'fiddich', 'deer', 'stag', '12', '15', '18', '21']
    },
    {
      id: 'johnnie_walker',
      name: 'Johnnie Walker',
      parent_company: 'Diageo',
      category: 'spirits',
      subcategory: 'blended_whisky',
      premium_tier: 'mainstream',
      typical_price_range: { min: 18, max: 180, currency: 'GBP' },
      market_share_uk: 12.1,
      brand_strength: 'stable',
      seasonal_peaks: ['christmas', 'new_year'],
      target_demographics: ['mainstream_whisky_drinkers', 'gift_buyers', 'males_25_plus'],
      distribution_channels: ['supermarkets', 'off_trade', 'on_trade', 'duty_free'],
      key_competitors: ['famous_grouse', 'teachers', 'bells'],
      usp: 'Keep walking - progressive blend ladder',
      abv_range: { min: 40, max: 43 },
      volume_sizes: [200, 350, 700, 1000],
      launch_year: 1820,
      origin_country: 'Scotland',
      keywords: ['johnnie', 'walker', 'red', 'black', 'blue', 'gold', 'green', 'walking']
    },
    
    // GIN - Premium segment
    {
      id: 'hendricks',
      name: 'Hendrick\'s Gin',
      parent_company: 'William Grant & Sons',
      category: 'spirits',
      subcategory: 'gin',
      premium_tier: 'premium',
      typical_price_range: { min: 32, max: 45, currency: 'GBP' },
      market_share_uk: 8.5,
      brand_strength: 'growing',
      seasonal_peaks: ['summer', 'christmas', 'gin_june'],
      target_demographics: ['gin_enthusiasts', 'millennials', 'craft_spirit_drinkers'],
      distribution_channels: ['premium_off_trade', 'craft_bars', 'restaurants'],
      key_competitors: ['tanqueray', 'bombay_sapphire', 'sipsmith'],
      usp: 'Cucumber and rose petal infusion with Victorian apothecary styling',
      abv_range: { min: 41.4, max: 41.4 },
      volume_sizes: [350, 700, 1000],
      launch_year: 1999,
      origin_country: 'Scotland',
      keywords: ['hendricks', 'hendrick', 'cucumber', 'rose', 'gin', 'botanical']
    },
    {
      id: 'tanqueray',
      name: 'Tanqueray',
      parent_company: 'Diageo',
      category: 'spirits',
      subcategory: 'gin',
      premium_tier: 'premium',
      typical_price_range: { min: 18, max: 35, currency: 'GBP' },
      market_share_uk: 15.2,
      brand_strength: 'stable',
      seasonal_peaks: ['summer', 'christmas'],
      target_demographics: ['gin_tonic_drinkers', 'classic_cocktail_lovers'],
      distribution_channels: ['supermarkets', 'off_trade', 'on_trade'],
      key_competitors: ['gordons', 'hendricks', 'bombay_sapphire'],
      usp: 'London Dry Gin heritage since 1830',
      abv_range: { min: 40, max: 47.3 },
      volume_sizes: [350, 700, 1000],
      launch_year: 1830,
      origin_country: 'England',
      keywords: ['tanqueray', 'london', 'dry', 'gin', 'classic', 'ten']
    },
    {
      id: 'sipsmith',
      name: 'Sipsmith',
      parent_company: 'Beam Suntory',
      category: 'spirits',
      subcategory: 'gin',
      premium_tier: 'premium',
      typical_price_range: { min: 28, max: 40, currency: 'GBP' },
      market_share_uk: 3.1,
      brand_strength: 'growing',
      seasonal_peaks: ['summer', 'craft_gin_season'],
      target_demographics: ['craft_gin_enthusiasts', 'london_locals', 'quality_seekers'],
      distribution_channels: ['craft_bars', 'premium_off_trade', 'independent_shops'],
      key_competitors: ['hendricks', 'monkey_47', 'plymouth'],
      usp: 'First copper pot distillery in London for 200 years',
      abv_range: { min: 41.6, max: 41.6 },
      volume_sizes: [700],
      launch_year: 2009,
      origin_country: 'England',
      keywords: ['sipsmith', 'london', 'craft', 'copper', 'pot', 'artisan']
    },
    
    // BEER - Craft segment
    {
      id: 'brewdog_punk_ipa',
      name: 'BrewDog Punk IPA',
      parent_company: 'BrewDog plc',
      category: 'beer',
      subcategory: 'craft_ipa',
      premium_tier: 'premium',
      typical_price_range: { min: 2.50, max: 4.00, currency: 'GBP' },
      market_share_uk: 1.8,
      brand_strength: 'stable',
      seasonal_peaks: ['summer', 'festival_season', 'friday_nights'],
      target_demographics: ['craft_beer_enthusiasts', 'millennials', 'urban_professionals'],
      distribution_channels: ['craft_beer_shops', 'bars', 'supermarkets', 'brewdog_bars'],
      key_competitors: ['sierra_nevada_ipa', 'stone_ipa', 'camden_hells'],
      usp: 'Punk attitude craft brewing pioneer with equity crowdfunding',
      abv_range: { min: 5.4, max: 5.6 },
      volume_sizes: [330, 440, 660],
      launch_year: 2007,
      origin_country: 'Scotland',
      keywords: ['brewdog', 'punk', 'ipa', 'craft', 'hop', 'bitter', 'pale', 'ale']
    },
    {
      id: 'camden_hells',
      name: 'Camden Hells Lager',
      parent_company: 'AB InBev',
      category: 'beer',
      subcategory: 'craft_lager',
      premium_tier: 'premium',
      typical_price_range: { min: 2.20, max: 3.50, currency: 'GBP' },
      market_share_uk: 0.9,
      brand_strength: 'growing',
      seasonal_peaks: ['summer', 'london_events'],
      target_demographics: ['london_millennials', 'craft_beer_curious', 'lager_drinkers'],
      distribution_channels: ['london_pubs', 'supermarkets', 'craft_beer_shops'],
      key_competitors: ['meantime_lager', 'beavertown', 'five_points'],
      usp: 'London craft lager with German brewing precision',
      abv_range: { min: 4.6, max: 4.6 },
      volume_sizes: [330, 440],
      launch_year: 2010,
      origin_country: 'England',
      keywords: ['camden', 'hells', 'lager', 'london', 'craft', 'german']
    },
    
    // WINE - New World
    {
      id: 'oyster_bay_sauvignon_blanc',
      name: 'Oyster Bay Sauvignon Blanc',
      parent_company: 'Delegat Wine Estate',
      category: 'wine',
      subcategory: 'sauvignon_blanc',
      premium_tier: 'mainstream',
      typical_price_range: { min: 8, max: 12, currency: 'GBP' },
      market_share_uk: 4.1,
      brand_strength: 'stable',
      seasonal_peaks: ['summer', 'christmas', 'barbecue_season'],
      target_demographics: ['wine_drinkers_25_50', 'female_skewed', 'entertaining_hosts'],
      distribution_channels: ['supermarkets', 'wine_shops', 'restaurants'],
      key_competitors: ['cloudy_bay', 'whitehaven', 'brancott_estate'],
      usp: 'Accessible New Zealand quality with crisp, fresh taste',
      abv_range: { min: 12.5, max: 13.5 },
      volume_sizes: [187, 375, 750, 1500],
      launch_year: 1991,
      origin_country: 'New Zealand',
      keywords: ['oyster', 'bay', 'sauvignon', 'blanc', 'marlborough', 'new', 'zealand']
    }
    
    // Add 200+ more brands covering all major categories...
  ]

  // Category intelligence data
  private static CATEGORY_DATA: AlcoholCategory[] = [
    {
      category: 'spirits',
      subcategories: ['whisky', 'gin', 'vodka', 'rum', 'brandy', 'tequila', 'liqueurs'],
      uk_market_size_gbp: 3200000000,
      annual_growth_rate: 2.3,
      seasonal_index: {
        january: 0.85, february: 0.80, march: 0.90, april: 0.95,
        may: 1.00, june: 1.05, july: 1.10, august: 1.05,
        september: 1.00, october: 1.15, november: 1.25, december: 1.45
      },
      average_margin: 45,
      typical_abv_range: { min: 20, max: 60 },
      shelf_life_months: 60,
      storage_requirements: 'Cool, dry place, away from direct sunlight',
      regulatory_notes: [
        'Minimum pricing legislation in Scotland',
        'Duty rates change annually',
        'Age statements must be accurate',
        'Health warnings required on labels'
      ],
      emerging_trends: [
        'Premium gin expansion',
        'Flavored whisky growth',
        'Sustainable packaging',
        'Low/no alcohol variants',
        'Craft distillery boom'
      ],
      price_elasticity: -0.4,
      consumer_behavior_notes: [
        'Gift-driven purchases in Q4',
        'Experience-focused consumption',
        'Brand loyalty high in premium segments',
        'Social media influence growing'
      ]
    },
    {
      category: 'beer',
      subcategories: ['lager', 'ale', 'ipa', 'stout', 'wheat_beer', 'sour', 'low_alcohol'],
      uk_market_size_gbp: 8900000000,
      annual_growth_rate: -1.2,
      seasonal_index: {
        january: 0.85, february: 0.80, march: 0.90, april: 1.05,
        may: 1.15, june: 1.25, july: 1.35, august: 1.30,
        september: 1.10, october: 1.00, november: 0.95, december: 1.05
      },
      average_margin: 35,
      typical_abv_range: { min: 0.5, max: 12 },
      shelf_life_months: 9,
      storage_requirements: 'Cool, dark conditions, consistent temperature',
      regulatory_notes: [
        'Strength categories affect duty rates',
        'Allergen labeling required',
        'Brewing license requirements'
      ],
      emerging_trends: [
        'Craft beer premiumization',
        'Low/no alcohol growth',
        'Sustainability focus',
        'Local brewery support',
        'Flavor innovation'
      ],
      price_elasticity: -0.8,
      consumer_behavior_notes: [
        'Weather-dependent consumption',
        'Event-driven sales spikes',
        'Brand switching common in mainstream',
        'Loyalty higher in craft segment'
      ]
    },
    {
      category: 'wine',
      subcategories: ['red_wine', 'white_wine', 'rose', 'sparkling', 'fortified', 'dessert'],
      uk_market_size_gbp: 5600000000,
      annual_growth_rate: 1.1,
      seasonal_index: {
        january: 0.90, february: 0.85, march: 0.95, april: 1.00,
        may: 1.05, june: 1.10, july: 1.15, august: 1.10,
        september: 1.05, october: 1.15, november: 1.20, december: 1.35
      },
      average_margin: 50,
      typical_abv_range: { min: 8, max: 15 },
      shelf_life_months: 24,
      storage_requirements: 'Consistent temperature, horizontal storage for cork wines',
      regulatory_notes: [
        'Vintage accuracy requirements',
        'Region of origin labeling',
        'Sulfite warnings',
        'Import duty variations by origin'
      ],
      emerging_trends: [
        'Natural wine movement',
        'English wine growth',
        'Sustainable viticulture',
        'Premium bag-in-box',
        'Wine tourism experiences'
      ],
      price_elasticity: -0.6,
      consumer_behavior_notes: [
        'Occasion-driven purchasing',
        'Gift market significant',
        'Education influences premiumization',
        'Food pairing awareness growing'
      ]
    }
  ]

  // Market segment intelligence
  private static MARKET_SEGMENTS: MarketIntelligence[] = [
    {
      segment_name: 'Premium Craft Gin',
      price_range: { min: 25, max: 60 },
      volume_share_percent: 12.5,
      value_share_percent: 22.1,
      growth_trajectory: 15.2,
      key_drivers: ['botanical innovation', 'craft authenticity', 'mixology culture'],
      threat_level: 'medium',
      opportunity_score: 85,
      competitive_intensity: 8.5,
      barriers_to_entry: ['brand building costs', 'distribution access', 'regulatory complexity']
    },
    {
      segment_name: 'Single Malt Whisky Collectors',
      price_range: { min: 80, max: 1000 },
      volume_share_percent: 3.2,
      value_share_percent: 18.7,
      growth_trajectory: 8.9,
      key_drivers: ['investment potential', 'exclusivity', 'heritage storytelling'],
      threat_level: 'low',
      opportunity_score: 92,
      competitive_intensity: 6.2,
      barriers_to_entry: ['age statement requirements', 'heritage credibility', 'high investment']
    }
  ]

  // Intelligent product matching system
  static identifyAlcoholProduct(sku: string, description?: string): AlcoholBrand | null {
    const searchText = `${sku} ${description || ''}`.toLowerCase()
    
    // Direct brand matching
    for (const brand of this.BRAND_DATABASE) {
      // Check primary name match
      if (searchText.includes(brand.name.toLowerCase())) {
        return brand
      }
      
      // Check keyword matches
      const keywordMatches = brand.keywords.filter(keyword => 
        searchText.includes(keyword.toLowerCase())
      )
      
      // If 2+ keywords match, it's likely this brand
      if (keywordMatches.length >= 2) {
        return brand
      }
      
      // Single strong keyword match (brand name components)
      const strongKeywords = brand.keywords.filter(k => k.length > 3)
      if (strongKeywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return brand
      }
    }
    
    // Category-based matching if no brand found
    return this.identifyByCategory(searchText)
  }

  private static identifyByCategory(searchText: string): AlcoholBrand | null {
    const categories = {
      gin: ['gin', 'botanical', 'juniper'],
      whisky: ['whisky', 'whiskey', 'malt', 'blend', 'scotch', 'bourbon'],
      vodka: ['vodka', 'premium', 'crystal', 'pure'],
      wine: ['wine', 'red', 'white', 'rose', 'chardonnay', 'merlot', 'sauvignon'],
      beer: ['beer', 'lager', 'ale', 'ipa', 'stout', 'pilsner'],
      rum: ['rum', 'dark', 'white', 'spiced', 'caribbean']
    }
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        // Return a generic brand for this category
        return this.getGenericBrandForCategory(category)
      }
    }
    
    return null
  }

  private static getGenericBrandForCategory(category: string): AlcoholBrand {
    const genericBrands: { [key: string]: AlcoholBrand } = {
      gin: {
        id: 'generic_gin',
        name: 'Premium Gin',
        parent_company: 'Independent',
        category: 'spirits',
        subcategory: 'gin',
        premium_tier: 'premium',
        typical_price_range: { min: 20, max: 40, currency: 'GBP' },
        market_share_uk: 0.1,
        brand_strength: 'stable',
        seasonal_peaks: ['summer'],
        target_demographics: ['gin_enthusiasts'],
        distribution_channels: ['off_trade'],
        key_competitors: ['hendricks', 'tanqueray'],
        usp: 'Quality gin with botanical complexity',
        abv_range: { min: 37.5, max: 47 },
        volume_sizes: [700],
        origin_country: 'UK',
        keywords: ['gin', 'botanical']
      }
      // Add more generic brands...
    }
    
    return genericBrands[category] || genericBrands.gin
  }

  // Advanced competitive analysis
  static analyzeCompetitivePosition(
    ourProduct: AlcoholSKU,
    identifiedBrand: AlcoholBrand,
    competitorPrices: CompetitorPrice[]
  ) {
    const ourPrice = parseFloat(ourProduct.price)
    const brandTypicalPrice = (identifiedBrand.typical_price_range.min + identifiedBrand.typical_price_range.max) / 2
    
    // Price positioning analysis
    const priceVsBrand = ((ourPrice - brandTypicalPrice) / brandTypicalPrice) * 100
    
    // Competitive landscape analysis
    const avgCompetitorPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
      : brandTypicalPrice
    
    const priceVsCompetitors = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100
    
    // Market opportunity assessment
    const categoryData = this.CATEGORY_DATA.find(c => c.category === identifiedBrand.category)
    const currentMonth = new Date().getMonth() + 1
    const seasonalFactor = categoryData?.seasonal_index[this.getMonthName(currentMonth)] || 1.0
    
    return {
      brand_match: identifiedBrand,
      price_analysis: {
        vs_brand_typical: priceVsBrand,
        vs_competitors: priceVsCompetitors,
        positioning: this.getPricePositioning(priceVsBrand),
        recommendation: this.getPriceRecommendation(priceVsBrand, priceVsCompetitors, identifiedBrand)
      },
      market_context: {
        category_growth: categoryData?.annual_growth_rate || 0,
        seasonal_factor: seasonalFactor,
        brand_strength: identifiedBrand.brand_strength,
        market_share: identifiedBrand.market_share_uk
      },
      strategic_insights: this.generateStrategicInsights(identifiedBrand, ourPrice, competitorPrices),
      opportunities: this.identifyOpportunities(identifiedBrand, ourProduct, seasonalFactor)
    }
  }

  private static getPricePositioning(priceVsBrand: number): string {
    if (priceVsBrand > 20) return 'premium_positioned'
    if (priceVsBrand > 5) return 'slightly_premium'
    if (priceVsBrand < -20) return 'value_positioned'
    if (priceVsBrand < -5) return 'slightly_discounted'
    return 'market_aligned'
  }

  private static getPriceRecommendation(
    priceVsBrand: number, 
    priceVsCompetitors: number, 
    brand: AlcoholBrand
  ): string {
    if (priceVsCompetitors > 15 && brand.premium_tier !== 'super_premium') {
      return 'Consider price reduction - significantly above competitors'
    }
    if (priceVsCompetitors < -15 && brand.premium_tier === 'premium') {
      return 'Pricing opportunity - can increase price vs competitors'
    }
    if (priceVsBrand > 30) {
      return 'Premium positioning justified if quality/service matches'
    }
    if (priceVsBrand < -30) {
      return 'Undervaluing brand - consider gradual price increase'
    }
    return 'Price positioning appears optimal'
  }

  private static generateStrategicInsights(
    brand: AlcoholBrand, 
    ourPrice: number, 
    competitors: CompetitorPrice[]
  ): string[] {
    const insights: string[] = []
    
    // Brand strength insights
    if (brand.brand_strength === 'growing' && competitors.length > 0) {
      insights.push(`${brand.name} is a growing brand - leverage momentum with premium positioning`)
    }
    
    // Seasonal insights
    const currentMonth = new Date().getMonth() + 1
    if (brand.seasonal_peaks.includes(this.getCurrentSeason(currentMonth))) {
      insights.push(`Peak season approaching for ${brand.category} - prepare inventory and consider seasonal pricing`)
    }
    
    // Competitive insights
    if (competitors.length > 3) {
      insights.push(`High competitor monitoring suggests strong market interest - differentiation important`)
    }
    
    // Category insights
    if (brand.category === 'spirits' && ourPrice > 40) {
      insights.push(`Premium spirits segment - focus on experience, education, and gift positioning`)
    }
    
    return insights
  }

  private static identifyOpportunities(
    brand: AlcoholBrand, 
    product: AlcoholSKU, 
    seasonalFactor: number
  ): string[] {
    const opportunities: string[] = []
    
    // Seasonal opportunities
    if (seasonalFactor > 1.2) {
      opportunities.push(`High seasonal demand period - increase marketing investment`)
    }
    
    // Brand portfolio opportunities
    if (brand.key_competitors.length > 2) {
      opportunities.push(`Consider expanding into complementary ${brand.category} brands`)
    }
    
    // Market trends
    if (brand.premium_tier === 'premium' && brand.brand_strength === 'growing') {
      opportunities.push(`Riding premiumization trend - potential for line extensions`)
    }
    
    return opportunities
  }

  // Utility methods
  private static getMonthName(month: number): string {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    return months[month - 1] || 'january'
  }

  private static getCurrentSeason(month: number): string {
    if (month >= 12 || month <= 2) return 'christmas'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 3 && month <= 5) return 'spring'
    return 'autumn'
  }

  // Public methods for integration
  static getBrandDatabase(): AlcoholBrand[] {
    return this.BRAND_DATABASE
  }

  static getCategoryData(): AlcoholCategory[] {
    return this.CATEGORY_DATA
  }

  static getMarketSegments(): MarketIntelligence[] {
    return this.MARKET_SEGMENTS
  }

  // Enhanced product matching with fuzzy logic
  static findBestProductMatch(sku: string, description?: string): {
    brand: AlcoholBrand | null,
    confidence: number,
    reasoning: string
  } {
    const searchText = `${sku} ${description || ''}`.toLowerCase()
    let bestMatch: AlcoholBrand | null = null
    let bestScore = 0
    let reasoning = ''
    
    for (const brand of this.BRAND_DATABASE) {
      let score = 0
      const matchReasons: string[] = []
      
      // Brand name exact match (highest priority)
      if (searchText.includes(brand.name.toLowerCase())) {
        score += 100
        matchReasons.push('brand name match')
      }
      
      // Keyword matches
      const keywordMatches = brand.keywords.filter(keyword => 
        searchText.includes(keyword.toLowerCase())
      )
      score += keywordMatches.length * 20
      if (keywordMatches.length > 0) {
        matchReasons.push(`${keywordMatches.length} keyword matches`)
      }
      
      // Category inference
      if (searchText.includes(brand.category) || searchText.includes(brand.subcategory)) {
        score += 15
        matchReasons.push('category match')
      }
      
      // ABV range matching (if available)
      const abvMatch = searchText.match(/(\d+(?:\.\d+)?)\s*%/)
      if (abvMatch) {
        const abv = parseFloat(abvMatch[1])
        if (abv >= brand.abv_range.min && abv <= brand.abv_range.max) {
          score += 10
          matchReasons.push('ABV match')
        }
      }
      
      // Volume size matching
      const volumeMatch = searchText.match(/(\d+)\s*ml/)
      if (volumeMatch) {
        const volume = parseInt(volumeMatch[1])
        if (brand.volume_sizes.includes(volume)) {
          score += 5
          matchReasons.push('volume match')
        }
      }
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = brand
        reasoning = matchReasons.join(', ')
      }
    }
    
    const confidence = Math.min(bestScore / 100, 1.0)
    
    return {
      brand: confidence > 0.3 ? bestMatch : null,
      confidence,
      reasoning: reasoning || 'No strong matches found'
    }
  }

  // Generate competitive intelligence report
  static generateCompetitiveReport(productAnalyses: any[]): {
    portfolio_analysis: any,
    market_positioning: any,
    competitive_threats: any[],
    opportunities: any[],
    strategic_recommendations: string[]
  } {
    const portfolio = {
      total_products: productAnalyses.length,
      categories: {} as any,
      premium_tiers: {} as any,
      brand_strength_distribution: {} as any,
      average_market_share: 0
    }
    
    // Analyze portfolio composition
    productAnalyses.forEach(analysis => {
      const { brand_match } = analysis
      if (!brand_match) return
      
      // Category breakdown
      if (!portfolio.categories[brand_match.category]) {
        portfolio.categories[brand_match.category] = 0
      }
      portfolio.categories[brand_match.category]++
      
      // Premium tier analysis
      if (!portfolio.premium_tiers[brand_match.premium_tier]) {
        portfolio.premium_tiers[brand_match.premium_tier] = 0
      }
      portfolio.premium_tiers[brand_match.premium_tier]++
      
      // Brand strength
      if (!portfolio.brand_strength_distribution[brand_match.brand_strength]) {
        portfolio.brand_strength_distribution[brand_match.brand_strength] = 0
      }
      portfolio.brand_strength_distribution[brand_match.brand_strength]++
    })
    
    // Market positioning analysis
    const positioning = {
      price_leadership_potential: this.assessPriceLeadership(productAnalyses),
      differentiation_opportunities: this.identifyDifferentiation(productAnalyses),
      market_gaps: this.findMarketGaps(productAnalyses),
      competitive_advantages: this.assessCompetitiveAdvantages(productAnalyses)
    }
    
    // Threat identification
    const threats = this.identifyCompetitiveThreats(productAnalyses)
    
    // Opportunity identification
    const opportunities = this.identifyMarketOpportunities(productAnalyses)
    
    // Strategic recommendations
    const recommendations = this.generateStrategicRecommendations(
      portfolio, positioning, threats, opportunities
    )
    
    return {
      portfolio_analysis: portfolio,
      market_positioning: positioning,
      competitive_threats: threats,
      opportunities,
      strategic_recommendations: recommendations
    }
  }

  private static assessPriceLeadership(analyses: any[]): any {
    const pricePositions = analyses.map(a => ({
      sku: a.sku,
      vs_competitors: a.price_analysis?.vs_competitors || 0,
      category: a.brand_match?.category
    }))
    
    const avgPosition = pricePositions.reduce((sum, p) => sum + p.vs_competitors, 0) / pricePositions.length
    
    return {
      overall_position: avgPosition > 10 ? 'premium' : avgPosition < -10 ? 'value' : 'competitive',
      price_leader_candidates: pricePositions.filter(p => p.vs_competitors < -15),
      premium_positioned: pricePositions.filter(p => p.vs_competitors > 15),
      recommendation: this.getPriceLeadershipRecommendation(avgPosition)
    }
  }

  private static identifyDifferentiation(analyses: any[]): any {
    const categories = {} as any
    
    analyses.forEach(analysis => {
      const category = analysis.brand_match?.category || 'unknown'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(analysis)
    })
    
    return {
      category_concentration: Object.keys(categories).length < 3 ? 'focused' : 'diversified',
      strongest_categories: Object.entries(categories)
        .sort(([,a]: any, [,b]: any) => b.length - a.length)
        .slice(0, 2)
        .map(([cat, products]: any) => ({ category: cat, count: products.length })),
      differentiation_potential: this.assessDifferentiationPotential(categories)
    }
  }

  private static findMarketGaps(analyses: any[]): string[] {
    const gaps: string[] = []
    const categories = new Set(analyses.map(a => a.brand_match?.category).filter(Boolean))
    const premiumTiers = new Set(analyses.map(a => a.brand_match?.premium_tier).filter(Boolean))
    
    // Category gaps
    if (!categories.has('gin') && categories.has('spirits')) {
      gaps.push('Gin segment opportunity - growing UK market')
    }
    if (!categories.has('craft_ipa') && categories.has('beer')) {
      gaps.push('Craft IPA segment missing - high growth potential')
    }
    if (!categories.has('wine') && categories.size < 3) {
      gaps.push('Wine category expansion opportunity')
    }
    
    // Premium tier gaps
    if (!premiumTiers.has('super_premium') && premiumTiers.has('premium')) {
      gaps.push('Super-premium tier opportunity for portfolio elevation')
    }
    
    return gaps
  }

  private static assessCompetitiveAdvantages(analyses: any[]): string[] {
    const advantages: string[] = []
    
    // Price advantages
    const priceAdvantages = analyses.filter(a => 
      a.price_analysis?.vs_competitors < -10 && 
      a.brand_match?.premium_tier !== 'value'
    )
    if (priceAdvantages.length > analyses.length * 0.3) {
      advantages.push('Strong price positioning across portfolio')
    }
    
    // Brand strength advantages
    const growingBrands = analyses.filter(a => a.brand_match?.brand_strength === 'growing')
    if (growingBrands.length > 0) {
      advantages.push(`${growingBrands.length} growing brands in portfolio`)
    }
    
    // Market share advantages
    const highShareBrands = analyses.filter(a => a.brand_match?.market_share_uk > 5)
    if (highShareBrands.length > 0) {
      advantages.push('Strong market share brands present')
    }
    
    return advantages
  }

  private static identifyCompetitiveThreats(analyses: any[]): any[] {
    const threats: any[] = []
    
    analyses.forEach(analysis => {
      if (analysis.price_analysis?.vs_competitors > 20) {
        threats.push({
          type: 'price_disadvantage',
          severity: 'high',
          product: analysis.sku,
          description: `Priced ${analysis.price_analysis.vs_competitors.toFixed(1)}% above competitors`,
          impact: 'Risk of market share loss',
          action_required: 'Price review or value justification needed'
        })
      }
      
      if (analysis.brand_match?.brand_strength === 'declining') {
        threats.push({
          type: 'declining_brand',
          severity: 'medium',
          product: analysis.sku,
          description: `${analysis.brand_match.name} showing declining brand strength`,
          impact: 'Long-term revenue erosion',
          action_required: 'Brand revitalization or portfolio optimization'
        })
      }
    })
    
    return threats.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
    })
  }

  private static identifyMarketOpportunities(analyses: any[]): any[] {
    const opportunities: any[] = []
    
    // Seasonal opportunities
    const currentMonth = new Date().getMonth() + 1
    const seasonalProducts = analyses.filter(a => {
      const category = this.CATEGORY_DATA.find(c => c.category === a.brand_match?.category)
      if (!category) return false
      const monthName = this.getMonthName(currentMonth)
      return (category.seasonal_index[monthName] || 1.0) > 1.2
    })
    
    if (seasonalProducts.length > 0) {
      opportunities.push({
        type: 'seasonal_demand',
        timeframe: 'immediate',
        products: seasonalProducts.length,
        description: `${seasonalProducts.length} products entering peak season`,
        revenue_potential: 'high',
        action_required: 'Inventory preparation and marketing focus'
      })
    }
    
    // Premium positioning opportunities
    const undervaluedProducts = analyses.filter(a => 
      a.price_analysis?.vs_competitors < -15 && 
      a.brand_match?.premium_tier === 'premium'
    )
    
    if (undervaluedProducts.length > 0) {
      opportunities.push({
        type: 'price_optimization',
        timeframe: 'short_term',
        products: undervaluedProducts.length,
        description: `${undervaluedProducts.length} premium products underpriced vs market`,
        revenue_potential: 'medium',
        action_required: 'Gradual price increases with value communication'
      })
    }
    
    return opportunities
  }

  private static generateStrategicRecommendations(
    portfolio: any, 
    positioning: any, 
    threats: any[], 
    opportunities: any[]
  ): string[] {
    const recommendations: string[] = []
    
    // Portfolio recommendations
    if (Object.keys(portfolio.categories).length < 2) {
      recommendations.push('Diversify portfolio across alcohol categories to reduce risk')
    }
    
    if (portfolio.premium_tiers.value > portfolio.premium_tiers.premium) {
      recommendations.push('Focus on premiumization to improve margins')
    }
    
    // Competitive recommendations
    if (threats.length > 0) {
      recommendations.push(`Address ${threats.length} competitive threats, starting with high-severity issues`)
    }
    
    if (opportunities.length > 0) {
      recommendations.push(`Capitalize on ${opportunities.length} market opportunities for growth`)
    }
    
    // Market positioning recommendations
    if (positioning.price_leadership_potential.overall_position === 'premium') {
      recommendations.push('Leverage premium positioning with quality and service differentiation')
    }
    
    return recommendations
  }

  private static getPriceLeadershipRecommendation(avgPosition: number): string {
    if (avgPosition > 15) {
      return 'High-price positioning requires strong value justification'
    } else if (avgPosition < -15) {
      return 'Value pricing strategy - ensure margins remain healthy'
    }
    return 'Competitive pricing strategy appears balanced'
  }

  private static assessDifferentiationPotential(categories: any): string {
    const categoryCount = Object.keys(categories).length
    if (categoryCount === 1) {
      return 'Highly focused - deep expertise potential'
    } else if (categoryCount <= 3) {
      return 'Focused diversification - manageable complexity'
    }
    return 'Broad diversification - consider focus areas'
  }
}
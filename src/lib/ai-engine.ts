// COMPLETE REPLACEMENT: /src/lib/ai-engine.ts
// Comprehensive AI Engine for Alcohol Industry InventoryIQ

import { AlcoholSKU, CompetitorPrice, MarketTrend } from '@/types'

interface HistoricalDataPoint {
  date: Date
  sales: number
  price: number
  inventory: number
  external_factors?: {
    weather?: string
    events?: string[]
    day_of_week?: number
    month?: number
    is_holiday?: boolean
    is_weekend?: boolean
    season?: 'spring' | 'summer' | 'fall' | 'winter'
  }
}

interface ForecastResult {
  predicted_demand: number
  confidence_interval: {
    lower: number
    upper: number
    confidence_level: number
  }
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality_factor: number
  category_trend: 'growing' | 'declining' | 'stable'
  recommendation: {
    action: 'increase_price' | 'decrease_price' | 'maintain_price' | 'reorder_stock' | 'promotional_pricing'
    confidence: number
    timing: 'immediate' | 'within_week' | 'within_month'
    expected_impact: {
      revenue_change: number
      profit_change: number
      risk_level: 'low' | 'medium' | 'high'
      competitive_risk?: number
    }
  }
  alcohol_specific: {
    seasonal_peak_in_days?: number
    competitor_price_position: 'leading' | 'competitive' | 'lagging'
    category_performance: 'outperforming' | 'underperforming' | 'average'
    compliance_notes?: string[]
  }
}

interface PriceElasticityModel {
  base_demand: number
  price_sensitivity: number
  seasonal_multiplier: number
  category_elasticity: number
  optimal_price_range: {
    min: number
    max: number
    recommended: number
  }
  competitor_influence: number
}

export class AIEngine {
  
  // Alcohol-specific seasonal patterns
  static SEASONAL_PATTERNS = {
    beer: {
      spring: 1.1,
      summer: 1.4,
      fall: 1.0,
      winter: 0.8,
      peak_months: [5, 6, 7, 8] // May-August
    },
    wine: {
      spring: 1.0,
      summer: 1.1,
      fall: 1.3,
      winter: 1.4,
      peak_months: [10, 11, 12, 1] // Oct-Jan
    },
    spirits: {
      spring: 0.9,
      summer: 1.0,
      fall: 1.2,
      winter: 1.5,
      peak_months: [11, 12, 1] // Nov-Jan
    },
    rtd: {
      spring: 1.2,
      summer: 1.5,
      fall: 1.0,
      winter: 0.7,
      peak_months: [4, 5, 6, 7, 8, 9] // Apr-Sep
    },
    cider: {
      spring: 1.0,
      summer: 1.1,
      fall: 1.4,
      winter: 0.9,
      peak_months: [9, 10, 11] // Sep-Nov
    }
  }

  // Category-specific price elasticity
  static CATEGORY_ELASTICITY = {
    beer: -0.8,    // Moderately elastic
    wine: -0.6,    // Less elastic (especially premium)
    spirits: -0.4, // Least elastic
    rtd: -1.2,     // Most elastic
    cider: -0.9
  }

  // Simple Moving Average with Exponential Smoothing
  static calculateExponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return []
    
    const smoothed = [data[0]]
    for (let i = 1; i < data.length; i++) {
      const value = alpha * data[i] + (1 - alpha) * smoothed[i - 1]
      smoothed.push(value)
    }
    return smoothed
  }

  // Detect trend using linear regression
  static detectTrend(data: number[]): { slope: number, trend: 'increasing' | 'decreasing' | 'stable' } {
    if (data.length < 2) return { slope: 0, trend: 'stable' }

    const n = data.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = data

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    let trend: 'increasing' | 'decreasing' | 'stable'
    if (Math.abs(slope) < 0.1) {
      trend = 'stable'
    } else if (slope > 0) {
      trend = 'increasing'
    } else {
      trend = 'decreasing'
    }

    return { slope, trend }
  }

  // Enhanced seasonal detection for alcohol categories
  static detectAlcoholSeasonality(
    data: number[], 
    category: string,
    currentMonth: number
  ): { factor: number, peakInDays: number, isApproachingPeak: boolean } {
    const patterns = this.SEASONAL_PATTERNS[category as keyof typeof this.SEASONAL_PATTERNS]
    
    if (!patterns) {
      return { factor: 1.0, peakInDays: 365, isApproachingPeak: false }
    }

    // Calculate current seasonal factor
    const currentSeason = this.getSeasonFromMonth(currentMonth) as 'spring' | 'summer' | 'fall' | 'winter'
    const seasonalFactor = patterns[currentSeason] || 1.0

    // Calculate days to peak season
    const nextPeakMonth = patterns.peak_months[0]
    const daysToNextPeak = this.calculateDaysToMonth(currentMonth, nextPeakMonth)
    const isApproachingPeak = daysToNextPeak <= 60 // Within 2 months

    return {
      factor: seasonalFactor,
      peakInDays: daysToNextPeak,
      isApproachingPeak
    }
  }

  private static getSeasonFromMonth(month: number): string {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }

  private static calculateDaysToMonth(currentMonth: number, targetMonth: number): number {
    let monthsAhead = targetMonth - currentMonth
    if (monthsAhead <= 0) monthsAhead += 12
    return monthsAhead * 30 // Approximate
  }

  // Enhanced price elasticity with competitor influence
  static calculateAlcoholPriceElasticity(
    historicalData: HistoricalDataPoint[],
    category: string,
    competitorPrices: CompetitorPrice[] = []
  ): PriceElasticityModel {
    
    if (historicalData.length < 3) {
      const baseElasticity = this.CATEGORY_ELASTICITY[category as keyof typeof this.CATEGORY_ELASTICITY] || -0.5
      const avgPrice = historicalData[0]?.price || 0
      
      return {
        base_demand: historicalData[0]?.sales || 0,
        price_sensitivity: baseElasticity,
        seasonal_multiplier: 1.0,
        category_elasticity: baseElasticity,
        optimal_price_range: {
          min: avgPrice * 0.9,
          max: avgPrice * 1.15,
          recommended: avgPrice
        },
        competitor_influence: 0.1
      }
    }

    // Enhanced price elasticity calculation
    const prices = historicalData.map(d => d.price)
    const demands = historicalData.map(d => d.sales)
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const avgDemand = demands.reduce((a, b) => a + b, 0) / demands.length

    // Calculate base elasticity
    let numerator = 0
    let denominator = 0
    for (let i = 0; i < prices.length; i++) {
      numerator += (prices[i] - avgPrice) * (demands[i] - avgDemand)
      denominator += Math.pow(prices[i] - avgPrice, 2)
    }
    const baseElasticity = denominator !== 0 ? numerator / denominator : this.CATEGORY_ELASTICITY[category as keyof typeof this.CATEGORY_ELASTICITY] || -0.5

    // Factor in competitor influence
    const competitorInfluence = this.calculateCompetitorInfluence(avgPrice, competitorPrices)
    
    // Seasonal multiplier
    const currentMonth = new Date().getMonth()
    const seasonality = this.detectAlcoholSeasonality(demands, category, currentMonth)

    return {
      base_demand: avgDemand,
      price_sensitivity: baseElasticity,
      seasonal_multiplier: seasonality.factor,
      category_elasticity: this.CATEGORY_ELASTICITY[category as keyof typeof this.CATEGORY_ELASTICITY] || -0.5,
      optimal_price_range: {
        min: avgPrice * 0.95,
        max: avgPrice * Math.min(1.2, 1 + competitorInfluence),
        recommended: avgPrice * (1 + Math.max(0, competitorInfluence / 2))
      },
      competitor_influence: competitorInfluence
    }
  }

  // Calculate how much competitors influence our pricing power
  private static calculateCompetitorInfluence(ourPrice: number, competitorPrices: CompetitorPrice[]): number {
    if (competitorPrices.length === 0) return 0.1

    const avgCompetitorPrice = competitorPrices.reduce((sum, comp) => sum + comp.competitor_price, 0) / competitorPrices.length
    const priceAdvantage = (ourPrice - avgCompetitorPrice) / avgCompetitorPrice
    
    // If we're significantly more expensive, we have less pricing power
    if (priceAdvantage > 0.15) return -0.1 // Negative influence (need to be more competitive)
    if (priceAdvantage < -0.15) return 0.2 // Positive influence (can increase prices)
    return 0.05 // Neutral
  }

  // Main alcohol-specific forecasting function
  static generateAlcoholForecast(
    alcoholSKU: AlcoholSKU,
    currentInventory: number,
    historicalData: HistoricalDataPoint[],
    competitorPrices: CompetitorPrice[] = [],
    forecastDays: number = 30
  ): ForecastResult {
    
    if (historicalData.length === 0) {
      return this.createFallbackForecast(alcoholSKU, currentInventory)
    }

    const salesData = historicalData.map(d => d.sales)
    const currentMonth = new Date().getMonth()
    
    // Apply exponential smoothing
    const smoothedSales = this.calculateExponentialSmoothing(salesData)
    
    // Detect trend with alcohol-specific considerations
    const { slope, trend } = this.detectTrend(smoothedSales)
    
    // Enhanced seasonality detection
    const seasonality = this.detectAlcoholSeasonality(salesData, alcoholSKU.category, currentMonth)
    
    // Category trend analysis
    const categoryTrend = this.analyzeCategoryTrend(alcoholSKU.category, salesData)
    
    // Calculate enhanced price elasticity
    const elasticityModel = this.calculateAlcoholPriceElasticity(
      historicalData, 
      alcoholSKU.category, 
      competitorPrices
    )
    
    // Base prediction with seasonal adjustment
    const lastSmoothed = smoothedSales[smoothedSales.length - 1]
    const trendAdjustment = slope * forecastDays
    const seasonalAdjustment = seasonality.isApproachingPeak ? seasonality.factor * 1.1 : seasonality.factor
    const basePrediction = Math.max(0, (lastSmoothed + trendAdjustment) * seasonalAdjustment)
    
    const predictedDemand = Math.round(basePrediction)
    
    // Enhanced confidence calculation
    const variance = this.calculateVariance(salesData)
    const dataQuality = Math.min(1, historicalData.length / 12) // More data = higher confidence
    const seasonalConfidence = seasonality.isApproachingPeak ? 0.9 : 0.7
    const competitorConfidence = competitorPrices.length > 0 ? 0.8 : 0.6
    
    const overallConfidence = (dataQuality + seasonalConfidence + competitorConfidence) / 3
    
    // Calculate confidence intervals
    const standardError = Math.sqrt(variance / salesData.length)
    const marginOfError = 1.96 * standardError
    
    // Generate alcohol-specific recommendation
    const recommendation = this.generateAlcoholRecommendation(
      alcoholSKU,
      currentInventory,
      predictedDemand,
      elasticityModel,
      trend,
      seasonality,
      competitorPrices,
      overallConfidence
    )

    return {
      predicted_demand: predictedDemand,
      confidence_interval: {
        lower: Math.max(0, Math.round(predictedDemand - marginOfError)),
        upper: Math.round(predictedDemand + marginOfError),
        confidence_level: overallConfidence
      },
      trend,
      seasonality_factor: seasonality.factor,
      category_trend: categoryTrend,
      recommendation,
      alcohol_specific: {
        seasonal_peak_in_days: seasonality.peakInDays,
        competitor_price_position: this.getCompetitorPosition(parseFloat(alcoholSKU.price), competitorPrices),
        category_performance: this.getCategoryPerformance(alcoholSKU.category, trend, categoryTrend),
        compliance_notes: this.getComplianceNotes(alcoholSKU)
      }
    }
  }

  // Analyze broader category trends
  private static analyzeCategoryTrend(category: string, salesData: number[]): 'growing' | 'declining' | 'stable' {
    // This would typically connect to market data
    // For now, simulate based on category knowledge
    const categoryGrowthRates = {
      beer: -0.02,    // Declining overall
      wine: 0.01,     // Slight growth
      spirits: 0.05,  // Strong growth
      rtd: 0.15,      // Explosive growth
      cider: 0.03     // Moderate growth
    }
    
    const growthRate = categoryGrowthRates[category as keyof typeof categoryGrowthRates] || 0
    
    if (growthRate > 0.02) return 'growing'
    if (growthRate < -0.02) return 'declining'
    return 'stable'
  }

  // Generate alcohol-specific recommendations
  private static generateAlcoholRecommendation(
    alcoholSKU: AlcoholSKU,
    currentInventory: number,
    predictedDemand: number,
    elasticityModel: PriceElasticityModel,
    trend: 'increasing' | 'decreasing' | 'stable',
    seasonality: any,
    competitorPrices: CompetitorPrice[],
    confidence: number
  ): ForecastResult['recommendation'] {
    
    const currentPrice = parseFloat(alcoholSKU.price)
    const weeksOfStock = currentInventory / (parseFloat(alcoholSKU.weekly_sales) || 1)
    
    let action: 'increase_price' | 'decrease_price' | 'maintain_price' | 'reorder_stock' | 'promotional_pricing'
    let timing: 'immediate' | 'within_week' | 'within_month' = 'within_week'
    let expectedRevenue = 0
    let expectedProfit = 0
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    let competitiveRisk = 0

    // Alcohol-specific decision logic
    if (weeksOfStock < 1) {
      action = 'reorder_stock'
      timing = 'immediate'
      riskLevel = 'high'
      expectedRevenue = -(predictedDemand * currentPrice * 0.3) // Lost sales
    } else if (seasonality.isApproachingPeak && weeksOfStock < 4) {
      action = 'reorder_stock'
      timing = 'immediate'
      riskLevel = 'high'
      expectedRevenue = predictedDemand * currentPrice * (seasonality.factor - 1)
    } else if (weeksOfStock > 12 && alcoholSKU.shelf_life_days && alcoholSKU.shelf_life_days < 180) {
      action = 'promotional_pricing'
      timing = 'immediate'
      riskLevel = 'medium'
      expectedRevenue = currentInventory * currentPrice * 0.8 - currentInventory * currentPrice // 20% discount
    } else {
      // Price optimization logic
      const competitorAdvantage = this.calculateCompetitorAdvantage(currentPrice, competitorPrices)
      
      if (competitorAdvantage < -0.1 && trend === 'increasing') {
        action = 'increase_price'
        expectedRevenue = predictedDemand * currentPrice * 0.05
        competitiveRisk = 0.1
      } else if (competitorAdvantage > 0.15) {
        action = 'decrease_price'
        expectedRevenue = predictedDemand * currentPrice * 0.1 // Volume increase
        competitiveRisk = -0.1
      } else if (seasonality.isApproachingPeak) {
        action = 'increase_price'
        expectedRevenue = predictedDemand * currentPrice * 0.08
        competitiveRisk = 0.05
      } else {
        action = 'maintain_price'
        expectedRevenue = 0
      }
    }

    expectedProfit = expectedRevenue * 0.35 // Assume 35% margin for alcohol

    return {
      action,
      confidence: Math.round(confidence * 100) / 100,
      timing,
      expected_impact: {
        revenue_change: Math.round(expectedRevenue),
        profit_change: Math.round(expectedProfit),
        risk_level: riskLevel,
        competitive_risk: competitiveRisk
      }
    }
  }

  // Helper methods
  private static calculateCompetitorAdvantage(ourPrice: number, competitorPrices: CompetitorPrice[]): number {
    if (competitorPrices.length === 0) return 0
    const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
    return (ourPrice - avgCompPrice) / avgCompPrice
  }

  private static getCompetitorPosition(ourPrice: number, competitorPrices: CompetitorPrice[]): 'leading' | 'competitive' | 'lagging' {
    if (competitorPrices.length === 0) return 'competitive'
    
    const advantage = this.calculateCompetitorAdvantage(ourPrice, competitorPrices)
    if (advantage < -0.1) return 'leading' // We're cheaper
    if (advantage > 0.1) return 'lagging'  // We're more expensive
    return 'competitive'
  }

  private static getCategoryPerformance(
    category: string, 
    trend: string, 
    categoryTrend: string
  ): 'outperforming' | 'underperforming' | 'average' {
    if (trend === 'increasing' && categoryTrend === 'growing') return 'outperforming'
    if (trend === 'decreasing' && categoryTrend === 'declining') return 'average'
    if (trend === 'increasing' && categoryTrend === 'declining') return 'outperforming'
    if (trend === 'decreasing' && categoryTrend === 'growing') return 'underperforming'
    return 'average'
  }

  private static getComplianceNotes(alcoholSKU: AlcoholSKU): string[] {
    const notes: string[] = []
    
    if (alcoholSKU.abv > 40) {
      notes.push('High-proof spirits: Additional tax implications')
    }
    
    if (alcoholSKU.state_restrictions && alcoholSKU.state_restrictions.length > 0) {
      notes.push(`Distribution restrictions: ${alcoholSKU.state_restrictions.join(', ')}`)
    }
    
    if (alcoholSKU.import_cost && alcoholSKU.import_cost > 0) {
      notes.push('Import duties and tariffs apply')
    }
    
    return notes
  }

  private static createFallbackForecast(alcoholSKU: AlcoholSKU, currentInventory: number): ForecastResult {
    const weeklySales = parseFloat(alcoholSKU.weekly_sales) || 0
    const currentPrice = parseFloat(alcoholSKU.price) || 0
    
    return {
      predicted_demand: Math.round(weeklySales * 4), // 4 weeks
      confidence_interval: { lower: 0, upper: Math.round(weeklySales * 6), confidence_level: 0.3 },
      trend: 'stable',
      seasonality_factor: 1.0,
      category_trend: 'stable',
      recommendation: {
        action: 'maintain_price',
        confidence: 0.3,
        timing: 'within_month',
        expected_impact: {
          revenue_change: 0,
          profit_change: 0,
          risk_level: 'high'
        }
      },
      alcohol_specific: {
        seasonal_peak_in_days: 180,
        competitor_price_position: 'competitive',
        category_performance: 'average',
        compliance_notes: this.getComplianceNotes(alcoholSKU)
      }
    }
  }

  // Calculate variance for confidence intervals
  private static calculateVariance(data: number[]): number {
    if (data.length === 0) return 0
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length
  }

  // Enhanced batch analysis for alcohol
  static analyzeAlcoholBatch(
    alcoholSKUs: AlcoholSKU[],
    competitorData: CompetitorPrice[] = []
  ) {
    const results = alcoholSKUs.map(sku => {
      const relatedCompetitors = competitorData.filter(c => c.sku === sku.sku)
      const historical = this.generateSyntheticAlcoholHistory(sku, 12)
      
      const forecast = this.generateAlcoholForecast(
        sku,
        parseInt(sku.inventory_level),
        historical,
        relatedCompetitors
      )
      
      return {
        sku: sku.sku,
        category: sku.category,
        current_metrics: {
          price: parseFloat(sku.price),
          inventory: parseInt(sku.inventory_level),
          weekly_sales: parseFloat(sku.weekly_sales)
        },
        forecast,
        ai_insights: this.generateAlcoholInsights(sku, forecast, relatedCompetitors)
      }
    })
    
    return {
      batch_results: results,
      summary: this.generateAlcoholBatchSummary(results),
      processed_at: new Date().toISOString()
    }
  }

  // Legacy compatibility method
  static analyzeBatch(
    skuData: Array<{
      sku: string
      currentPrice: number
      currentInventory: number
      weeklySales: number
      historicalData?: HistoricalDataPoint[]
    }>
  ) {
    // Convert to AlcoholSKU format
    const alcoholSKUs: AlcoholSKU[] = skuData.map(item => ({
      sku: item.sku,
      price: item.currentPrice.toString(),
      weekly_sales: item.weeklySales.toString(),
      inventory_level: item.currentInventory.toString(),
      category: 'spirits', // Default category
      subcategory: 'Unknown',
      brand: 'Unknown',
      abv: 40,
      volume_ml: 750,
      container_type: 'bottle',
      distributor: 'Unknown'
    }))

    return this.analyzeAlcoholBatch(alcoholSKUs, [])
  }

  // Generate synthetic historical data for alcohol SKUs
  private static generateSyntheticAlcoholHistory(
    alcoholSKU: AlcoholSKU, 
    weeks: number
  ): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = []
    const baseDate = new Date()
    const avgWeeklySales = parseFloat(alcoholSKU.weekly_sales) || 10
    const currentPrice = parseFloat(alcoholSKU.price) || 20
    
    for (let i = weeks; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (i * 7))
      
      // Enhanced seasonal factors for alcohol
      const month = date.getMonth()
      const seasonalFactor = this.getSeasonalFactor(alcoholSKU.category, month)
      
      // Holiday boost
      const holidayFactor = this.isHolidayPeriod(date) ? 1.3 : 1.0
      
      // Weekend factor for alcohol
      const dayOfWeek = date.getDay()
      const weekendFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.2 : 1.0
      
      // Category trend
      const trendFactor = 1 + (weeks - i) * this.getCategoryGrowthRate(alcoholSKU.category) / 52
      
      // Random variance
      const randomFactor = 0.8 + Math.random() * 0.4
      
      const sales = Math.round(
        avgWeeklySales * seasonalFactor * holidayFactor * 
        weekendFactor * trendFactor * randomFactor
      )
      
      // Price variance (alcohol prices more stable)
      const priceVariance = 0.98 + Math.random() * 0.04
      const price = currentPrice * priceVariance
      
      data.push({
        date,
        sales: Math.max(0, sales),
        price: Math.round(price * 100) / 100,
        inventory: sales * 3 + Math.random() * 30,
        external_factors: {
          day_of_week: dayOfWeek,
          month: month,
          is_holiday: this.isHolidayPeriod(date),
          is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
          season: this.getSeasonFromMonth(month) as 'spring' | 'summer' | 'fall' | 'winter'
        }
      })
    }
    
    return data
  }

  private static getSeasonalFactor(category: string, month: number): number {
    const patterns = this.SEASONAL_PATTERNS[category as keyof typeof this.SEASONAL_PATTERNS]
    if (!patterns) return 1.0
    
    const season = this.getSeasonFromMonth(month) as 'spring' | 'summer' | 'fall' | 'winter'
    return patterns[season] || 1.0
  }

  private static getCategoryGrowthRate(category: string): number {
    const rates = {
      beer: -0.02,
      wine: 0.01,
      spirits: 0.05,
      rtd: 0.15,
      cider: 0.03
    }
    return rates[category as keyof typeof rates] || 0
  }

  private static isHolidayPeriod(date: Date): boolean {
    const month = date.getMonth()
    const day = date.getDate()
    
    return (
      (month === 11 && day >= 15) || // Christmas season
      (month === 0 && day <= 15) ||  // New Year season
      (month === 10 && day >= 20) || // Thanksgiving
      (month === 6 && day >= 1 && day <= 7) || // July 4th week
      (month === 4 && day >= 25) ||  // Memorial Day weekend
      (month === 8 && day >= 1 && day <= 7) // Labor Day weekend
    )
  }

  // Generate alcohol-specific insights
  private static generateAlcoholInsights(
    alcoholSKU: AlcoholSKU,
    forecast: ForecastResult,
    competitorPrices: CompetitorPrice[]
  ): string[] {
    const insights: string[] = []
    const currentPrice = parseFloat(alcoholSKU.price)
    const weeksOfStock = parseInt(alcoholSKU.inventory_level) / parseFloat(alcoholSKU.weekly_sales)
    
    // Seasonal insights
    if (forecast.alcohol_specific.seasonal_peak_in_days && forecast.alcohol_specific.seasonal_peak_in_days < 60) {
      insights.push(`Peak season approaching in ${forecast.alcohol_specific.seasonal_peak_in_days} days - prepare inventory`)
    }
    
    // Category performance
    if (forecast.alcohol_specific.category_performance === 'outperforming') {
      insights.push(`${alcoholSKU.sku} outperforming ${alcoholSKU.category} category average`)
    }
    
    // Competitor insights
    if (competitorPrices.length > 0) {
      const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
      const priceDiff = ((currentPrice - avgCompPrice) / avgCompPrice * 100)
      
      if (priceDiff > 15) {
        insights.push(`Priced ${priceDiff.toFixed(0)}% above competitors - risk of lost sales`)
      } else if (priceDiff < -15) {
        insights.push(`Priced ${Math.abs(priceDiff).toFixed(0)}% below competitors - pricing opportunity`)
      }
    }
    
    // Inventory insights
    if (weeksOfStock < 2) {
      insights.push(`Critical: Only ${weeksOfStock.toFixed(1)} weeks of stock - immediate reorder needed`)
    } else if (weeksOfStock > 10 && alcoholSKU.shelf_life_days && alcoholSKU.shelf_life_days < 365) {
      insights.push(`Overstock with limited shelf life - consider promotional pricing`)
    }
    
    // Category-specific insights
    if (alcoholSKU.category === 'beer' && alcoholSKU.craft) {
      insights.push('Craft beer: Premium pricing and local marketing opportunities')
    } else if (alcoholSKU.category === 'spirits' && currentPrice > 50) {
      insights.push('Premium spirits: Focus on experience and education marketing')
    } else if (alcoholSKU.category === 'rtd') {
      insights.push('RTD category: Emphasize convenience and seasonal promotions')
    }
    
    // Compliance insights
    if (forecast.alcohol_specific.compliance_notes && forecast.alcohol_specific.compliance_notes.length > 0) {
      insights.push(`Compliance: ${forecast.alcohol_specific.compliance_notes[0]}`)
    }
    
    return insights
  }

  // Generate enhanced batch summary for alcohol
  private static generateAlcoholBatchSummary(results: any[]) {
    const totalRevenuePotential = results.reduce((sum, r) => 
      sum + (r.forecast.recommendation.expected_impact.revenue_change || 0), 0
    )
    
    const highConfidenceCount = results.filter(r => 
      r.forecast.confidence_interval.confidence_level > 0.8
    ).length
    
    const criticalStockCount = results.filter(r => {
      const weeksOfStock = r.current_metrics.inventory / (r.current_metrics.weekly_sales || 1)
      return weeksOfStock < 2
    }).length
    
    // Category breakdown
    const categoryBreakdown = results.reduce((acc, r) => {
      const category = r.category
      if (!acc[category]) {
        acc[category] = { count: 0, revenue_potential: 0, avg_confidence: 0 }
      }
      acc[category].count++
      acc[category].revenue_potential += r.forecast.recommendation.expected_impact.revenue_change || 0
      acc[category].avg_confidence += r.forecast.confidence_interval.confidence_level
      return acc
    }, {} as Record<string, any>)
    
    // Calculate averages
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].avg_confidence = 
        categoryBreakdown[category].avg_confidence / categoryBreakdown[category].count
    })
    
    return {
      total_skus: results.length,
      total_revenue_potential: Math.round(totalRevenuePotential),
      high_confidence_predictions: highConfidenceCount,
      critical_stock_alerts: criticalStockCount,
      avg_confidence: Math.round(
        results.reduce((sum, r) => sum + r.forecast.confidence_interval.confidence_level, 0) / results.length * 100
      ),
      category_breakdown: categoryBreakdown,
      seasonal_opportunities: this.identifySeasonalOpportunities(results),
      competitor_threats: this.identifyCompetitorThreats(results)
    }
  }
  
  private static identifySeasonalOpportunities(results: any[]) {
    return results
      .filter(r => r.forecast.alcohol_specific.seasonal_peak_in_days && r.forecast.alcohol_specific.seasonal_peak_in_days < 90)
      .map(r => ({
        category: r.category,
        sku: r.sku,
        days_to_peak: r.forecast.alcohol_specific.seasonal_peak_in_days,
        revenue_potential: r.forecast.recommendation.expected_impact.revenue_change
      }))
      .sort((a, b) => a.days_to_peak - b.days_to_peak)
      .slice(0, 5)
  }
  
  private static identifyCompetitorThreats(results: any[]) {
    return results
      .filter(r => r.forecast.alcohol_specific.competitor_price_position === 'lagging')
      .map(r => ({
        sku: r.sku,
        category: r.category,
        threat_level: r.forecast.recommendation.expected_impact.competitive_risk > 0.1 ? 'high' : 'medium',
        action_needed: r.forecast.recommendation.action
      }))
      .slice(0, 5)
  }

  // Simplified seasonality detection for legacy compatibility
  static detectSeasonality(data: number[], period: number = 7): number {
    if (data.length < period * 2) return 1.0

    const periods = Math.floor(data.length / period)
    const averages: number[] = []

    for (let p = 0; p < periods; p++) {
      let sum = 0
      for (let i = 0; i < period; i++) {
        sum += data[p * period + i] || 0
      }
      averages.push(sum / period)
    }

    const overallAverage = averages.reduce((a, b) => a + b, 0) / averages.length
    const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / averages.length
    
    return 1.0 + (variance / (overallAverage || 1))
  }

  // Legacy price elasticity calculation
  static calculatePriceElasticity(historicalData: HistoricalDataPoint[]): any {
    if (historicalData.length < 3) {
      return {
        base_demand: historicalData[0]?.sales || 0,
        price_sensitivity: -0.5,
        optimal_price_range: {
          min: historicalData[0]?.price * 0.9 || 0,
          max: historicalData[0]?.price * 1.1 || 0
        }
      }
    }

    const prices = historicalData.map(d => d.price)
    const demands = historicalData.map(d => d.sales)
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const avgDemand = demands.reduce((a, b) => a + b, 0) / demands.length

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < prices.length; i++) {
      numerator += (prices[i] - avgPrice) * (demands[i] - avgDemand)
      denominator += Math.pow(prices[i] - avgPrice, 2)
    }

    const priceElasticity = denominator !== 0 ? numerator / denominator : -0.5
    
    return {
      base_demand: avgDemand,
      price_sensitivity: priceElasticity,
      optimal_price_range: {
        min: avgPrice * 0.95,
        max: avgPrice * 1.15
      }
    }
  }

  // Main forecasting function - legacy compatibility
  static generateForecast(
    sku: string,
    currentPrice: number,
    currentInventory: number,
    historicalData: HistoricalDataPoint[],
    forecastDays: number = 30
  ): any {
    
    // Convert to AlcoholSKU format
    const alcoholSKU: AlcoholSKU = {
      sku,
      price: currentPrice.toString(),
      weekly_sales: '10', // Default
      inventory_level: currentInventory.toString(),
      category: 'spirits',
      subcategory: 'Unknown',
      brand: 'Unknown',
      abv: 40,
      volume_ml: 750,
      container_type: 'bottle',
      distributor: 'Unknown'
    }
    
    return this.generateAlcoholForecast(alcoholSKU, currentInventory, historicalData, [], forecastDays)
  }

  // Generate synthetic history for legacy compatibility  
  static generateSyntheticHistory(
    avgWeeklySales: number, 
    currentPrice: number, 
    weeks: number
  ): HistoricalDataPoint[] {
    const alcoholSKU: AlcoholSKU = {
      sku: 'LEGACY-SKU',
      price: currentPrice.toString(),
      weekly_sales: avgWeeklySales.toString(),
      inventory_level: '100',
      category: 'spirits',
      subcategory: 'Unknown',
      brand: 'Unknown',
      abv: 40,
      volume_ml: 750,
      container_type: 'bottle',
      distributor: 'Unknown'
    }
    
    return this.generateSyntheticAlcoholHistory(alcoholSKU, weeks)
  }

  // Generate insights for legacy compatibility
  static generateInsights(item: any, forecast: any): string[] {
    const alcoholSKU: AlcoholSKU = {
      sku: item.sku || 'UNKNOWN',
      price: item.currentPrice?.toString() || '0',
      weekly_sales: item.weeklySales?.toString() || '0',
      inventory_level: item.currentInventory?.toString() || '0',
      category: 'spirits',
      subcategory: 'Unknown',
      brand: 'Unknown',
      abv: 40,
      volume_ml: 750,
      container_type: 'bottle',
      distributor: 'Unknown'
    }
    
    return this.generateAlcoholInsights(alcoholSKU, forecast, [])
  }

  // Generate batch summary for legacy compatibility
  static generateBatchSummary(results: any[]) {
    return this.generateAlcoholBatchSummary(results)
  }
}

// Export both classes for maximum compatibility
export class AlcoholAIEngine extends AIEngine {}

// Default export for easier imports
export default AIEngine
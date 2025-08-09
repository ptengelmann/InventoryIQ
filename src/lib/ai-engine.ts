// Real AI Engine for InventoryIQ - Demand Forecasting & Price Optimization

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
  recommendation: {
    action: 'increase_price' | 'decrease_price' | 'maintain_price' | 'reorder_stock'
    confidence: number
    expected_impact: {
      revenue_change: number
      profit_change: number
      risk_level: 'low' | 'medium' | 'high'
    }
  }
}

interface PriceElasticityModel {
  base_demand: number
  price_sensitivity: number
  optimal_price_range: {
    min: number
    max: number
  }
}

export class AIEngine {
  
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

  // Seasonality detection using simple periodic analysis
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
    
    // Return seasonality factor (1.0 = no seasonality, >1.0 = seasonal)
    return 1.0 + (variance / (overallAverage || 1))
  }

  // Price elasticity calculation
  static calculatePriceElasticity(historicalData: HistoricalDataPoint[]): PriceElasticityModel {
    if (historicalData.length < 3) {
      return {
        base_demand: historicalData[0]?.sales || 0,
        price_sensitivity: -0.5, // Default elasticity
        optimal_price_range: {
          min: historicalData[0]?.price * 0.9 || 0,
          max: historicalData[0]?.price * 1.1 || 0
        }
      }
    }

    // Simple linear regression for price vs demand
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

  // Main forecasting function
  static generateForecast(
    sku: string,
    currentPrice: number,
    currentInventory: number,
    historicalData: HistoricalDataPoint[],
    forecastDays: number = 30
  ): ForecastResult {
    
    if (historicalData.length === 0) {
      // Fallback for no historical data
      return {
        predicted_demand: 0,
        confidence_interval: { lower: 0, upper: 0, confidence_level: 0.5 },
        trend: 'stable',
        seasonality_factor: 1.0,
        recommendation: {
          action: 'maintain_price',
          confidence: 0.3,
          expected_impact: {
            revenue_change: 0,
            profit_change: 0,
            risk_level: 'high'
          }
        }
      }
    }

    // Extract sales data for analysis
    const salesData = historicalData.map(d => d.sales)
    const priceData = historicalData.map(d => d.price)
    
    // Apply exponential smoothing
    const smoothedSales = this.calculateExponentialSmoothing(salesData)
    
    // Detect trend
    const { slope, trend } = this.detectTrend(smoothedSales)
    
    // Detect seasonality
    const seasonalityFactor = this.detectSeasonality(salesData)
    
    // Calculate price elasticity
    const elasticityModel = this.calculatePriceElasticity(historicalData)
    
    // Base prediction (last smoothed value + trend)
    const lastSmoothed = smoothedSales[smoothedSales.length - 1]
    const trendAdjustment = slope * forecastDays
    const basePrediction = Math.max(0, lastSmoothed + trendAdjustment)
    
    // Apply seasonality (simplified - in reality would be more complex)
    const seasonalAdjustment = seasonalityFactor > 1.2 ? 1.1 : 1.0
    const predictedDemand = Math.round(basePrediction * seasonalAdjustment)
    
    // Calculate confidence intervals
    const variance = this.calculateVariance(salesData)
    const standardError = Math.sqrt(variance / salesData.length)
    const confidenceLevel = Math.min(0.95, Math.max(0.6, 1 - (variance / (lastSmoothed || 1))))
    
    const marginOfError = 1.96 * standardError // 95% confidence interval
    const lowerBound = Math.max(0, Math.round(predictedDemand - marginOfError))
    const upperBound = Math.round(predictedDemand + marginOfError)
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(
      currentPrice,
      currentInventory,
      predictedDemand,
      elasticityModel,
      trend,
      confidenceLevel
    )
    
    return {
      predicted_demand: predictedDemand,
      confidence_interval: {
        lower: lowerBound,
        upper: upperBound,
        confidence_level: confidenceLevel
      },
      trend,
      seasonality_factor: seasonalityFactor,
      recommendation
    }
  }

  // Calculate variance for confidence intervals
  private static calculateVariance(data: number[]): number {
    if (data.length === 0) return 0
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length
  }

  // Generate intelligent recommendations
  private static generateRecommendation(
    currentPrice: number,
    currentInventory: number,
    predictedDemand: number,
    elasticityModel: PriceElasticityModel,
    trend: 'increasing' | 'decreasing' | 'stable',
    confidence: number
  ): ForecastResult['recommendation'] {
    
    const weeksOfStock = currentInventory / (predictedDemand / 30 * 7) // Convert daily to weekly
    
    let action: 'increase_price' | 'decrease_price' | 'maintain_price' | 'reorder_stock'
    let expectedRevenue = 0
    let expectedProfit = 0
    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    
    // Decision logic
    if (weeksOfStock < 2) {
      // Low stock - either reorder or increase price
      if (trend === 'increasing' && confidence > 0.8) {
        action = 'increase_price'
        expectedRevenue = predictedDemand * currentPrice * 1.05 - predictedDemand * currentPrice
        riskLevel = 'low'
      } else {
        action = 'reorder_stock'
        expectedRevenue = 0
        riskLevel = 'high'
      }
    } else if (weeksOfStock > 8) {
      // High stock - decrease price to move inventory
      action = 'decrease_price'
      expectedRevenue = predictedDemand * 1.2 * currentPrice * 0.95 - predictedDemand * currentPrice
      riskLevel = 'medium'
    } else if (trend === 'increasing' && confidence > 0.7) {
      // Good trend with confidence - optimize price upward
      action = 'increase_price'
      expectedRevenue = predictedDemand * currentPrice * 1.03 - predictedDemand * currentPrice
      riskLevel = 'low'
    } else if (trend === 'decreasing') {
      // Declining trend - be conservative
      action = 'decrease_price'
      expectedRevenue = predictedDemand * 1.1 * currentPrice * 0.97 - predictedDemand * currentPrice
      riskLevel = 'medium'
    } else {
      // Stable or uncertain - maintain
      action = 'maintain_price'
      expectedRevenue = 0
      riskLevel = 'low'
    }
    
    expectedProfit = expectedRevenue * 0.3 // Assume 30% margin
    
    return {
      action,
      confidence: Math.round(confidence * 100) / 100,
      expected_impact: {
        revenue_change: Math.round(expectedRevenue),
        profit_change: Math.round(expectedProfit),
        risk_level: riskLevel
      }
    }
  }

  // Enhanced analysis with multiple SKUs
  static analyzeBatch(
    skuData: Array<{
      sku: string
      currentPrice: number
      currentInventory: number
      weeklySales: number
      historicalData?: HistoricalDataPoint[]
    }>
  ) {
    const results = skuData.map(item => {
      // Generate synthetic historical data if none provided
      const historical = item.historicalData || this.generateSyntheticHistory(
        item.weeklySales, 
        item.currentPrice,
        12 // 12 weeks of data
      )
      
      const forecast = this.generateForecast(
        item.sku,
        item.currentPrice,
        item.currentInventory,
        historical
      )
      
      return {
        sku: item.sku,
        current_metrics: {
          price: item.currentPrice,
          inventory: item.currentInventory,
          weekly_sales: item.weeklySales
        },
        forecast,
        ai_insights: this.generateInsights(item, forecast)
      }
    })
    
    return {
      batch_results: results,
      summary: this.generateBatchSummary(results),
      processed_at: new Date().toISOString()
    }
  }

  // Generate synthetic historical data for demonstration
  private static generateSyntheticHistory(
    avgWeeklySales: number, 
    currentPrice: number, 
    weeks: number
  ): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = []
    const baseDate = new Date()
    
    for (let i = weeks; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (i * 7))
      
      // Add some realistic variance
      const seasonalFactor = 1 + 0.2 * Math.sin((weeks - i) * 2 * Math.PI / 52) // Annual seasonality
      const randomFactor = 0.8 + Math.random() * 0.4 // ±20% random variance
      const trendFactor = 1 + (weeks - i) * 0.01 // Small upward trend
      
      const sales = Math.round(avgWeeklySales * seasonalFactor * randomFactor * trendFactor)
      const priceVariance = 0.95 + Math.random() * 0.1 // ±5% price variance
      const price = currentPrice * priceVariance
      
      data.push({
        date,
        sales: Math.max(0, sales),
        price: Math.round(price * 100) / 100,
        inventory: sales * 4 + Math.random() * 50, // Rough inventory estimate
        external_factors: {
          day_of_week: date.getDay(),
          month: date.getMonth(),
          is_holiday: this.isHoliday(date)
        }
      })
    }
    
    return data
  }

  // Simple holiday detection
  private static isHoliday(date: Date): boolean {
    const month = date.getMonth()
    const day = date.getDate()
    
    // Major holidays (simplified)
    return (
      (month === 11 && day >= 20) || // Christmas season
      (month === 0 && day <= 10) ||  // New Year season
      (month === 10 && day >= 20) || // Thanksgiving season
      (month === 6 && day === 4)     // July 4th
    )
  }

  // Generate human-readable insights
  private static generateInsights(
    item: any,
    forecast: ForecastResult
  ): string[] {
    const insights: string[] = []
    
    if (forecast.trend === 'increasing') {
      insights.push(`📈 Demand is trending upward - great opportunity for price optimization`)
    } else if (forecast.trend === 'decreasing') {
      insights.push(`📉 Demand is declining - consider promotional strategies`)
    }
    
    if (forecast.confidence_interval.confidence_level > 0.8) {
      insights.push(`🎯 High confidence prediction (${Math.round(forecast.confidence_interval.confidence_level * 100)}%) - safe to act on`)
    }
    
    if (forecast.seasonality_factor > 1.2) {
      insights.push(`🌊 Strong seasonal pattern detected - timing is crucial`)
    }
    
    const weeksOfStock = item.currentInventory / (item.weeklySales || 1)
    if (weeksOfStock < 2) {
      insights.push(`⚠️ Critical: Only ${weeksOfStock.toFixed(1)} weeks of stock remaining`)
    } else if (weeksOfStock > 8) {
      insights.push(`📦 Overstock situation: ${weeksOfStock.toFixed(1)} weeks of inventory`)
    }
    
    if (forecast.recommendation.expected_impact.revenue_change > 0) {
      insights.push(`💰 Potential revenue increase: $${forecast.recommendation.expected_impact.revenue_change}`)
    }
    
    return insights
  }

  // Generate batch summary
  private static generateBatchSummary(results: any[]) {
    const totalRevenuePotential = results.reduce((sum, r) => 
      sum + (r.forecast.recommendation.expected_impact.revenue_change || 0), 0
    )
    
    const highConfidenceCount = results.filter(r => 
      r.forecast.confidence_interval.confidence_level > 0.8
    ).length
    
    const riskySKUs = results.filter(r => 
      r.forecast.recommendation.expected_impact.risk_level === 'high'
    ).length
    
    return {
      total_skus: results.length,
      total_revenue_potential: Math.round(totalRevenuePotential),
      high_confidence_predictions: highConfidenceCount,
      high_risk_skus: riskySKUs,
      avg_confidence: Math.round(
        results.reduce((sum, r) => sum + r.forecast.confidence_interval.confidence_level, 0) / results.length * 100
      )
    }
  }
}
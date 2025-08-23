// /src/lib/utils.ts - REPLACE with market-intelligent version

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlcoholAIEngine } from './ai-engine'
import { AlcoholMarketIntelligence } from './alcohol-market-intelligence'
import { AlcoholInsightsEngine } from './alcohol-insights-engine'
import { AlcoholSKU, CompetitorPrice } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV parsing utilities
export function parseCSVData(csvContent: string) {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  const data = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    
    row.id = index + 1
    return row
  })
  
  return { headers, data }
}

// Enhanced convert CSV row to AlcoholSKU with market intelligence
export function convertToAlcoholSKU(csvRow: any): AlcoholSKU {
  const baseSKU: AlcoholSKU = {
    sku: csvRow.sku || '',
    price: csvRow.price || '0',
    weekly_sales: csvRow.weekly_sales || '0',
    inventory_level: csvRow.inventory_level || '0',
    category: csvRow.category || 'spirits',
    subcategory: csvRow.subcategory || '',
    brand: csvRow.brand || '',
    abv: parseFloat(csvRow.abv) || 0,
    volume_ml: parseInt(csvRow.volume_ml) || 750,
    container_type: csvRow.container_type || 'bottle',
    seasonal_peak: csvRow.seasonal_peak || undefined,
    shelf_life_days: csvRow.shelf_life_days ? parseInt(csvRow.shelf_life_days) : undefined,
    distributor: csvRow.distributor || '',
    state_restrictions: csvRow.state_restrictions ? csvRow.state_restrictions.split('|') : undefined,
    origin_country: csvRow.origin_country || undefined,
    origin_region: csvRow.origin_region || undefined,
    vintage_year: csvRow.vintage_year ? parseInt(csvRow.vintage_year) : undefined,
    organic: csvRow.organic === 'true',
    gluten_free: csvRow.gluten_free === 'true',
    craft: csvRow.craft === 'true',
    import_cost: csvRow.import_cost ? parseFloat(csvRow.import_cost) : undefined,
    excise_tax: csvRow.excise_tax ? parseFloat(csvRow.excise_tax) : undefined
  }
  
  // Enhance with market intelligence if basic info is missing
  const productMatch = AlcoholMarketIntelligence.findBestProductMatch(baseSKU.sku)
  if (productMatch.brand && productMatch.confidence > 0.3) {
    const brand = productMatch.brand
    
    // Fill in missing data from brand intelligence
    if (!baseSKU.category || baseSKU.category === 'spirits') {
      baseSKU.category = brand.category as any
    }
    if (!baseSKU.subcategory) {
      baseSKU.subcategory = brand.subcategory
    }
    if (!baseSKU.brand) {
      baseSKU.brand = brand.name
    }
    if (!baseSKU.abv) {
      baseSKU.abv = (brand.abv_range.min + brand.abv_range.max) / 2
    }
    if (!baseSKU.volume_ml || baseSKU.volume_ml === 750) {
      baseSKU.volume_ml = brand.volume_sizes[0]
    }
    if (!baseSKU.origin_country) {
      baseSKU.origin_country = brand.origin_country
    }
    
    // Add seasonal intelligence
    if (brand.seasonal_peaks.length > 0) {
      baseSKU.seasonal_peak = brand.seasonal_peaks[0] as any
    }
  }
  
  return baseSKU
}

// Enhanced AI-powered price recommendation with market intelligence
export function calculatePriceRecommendation(
  currentPrice: number,
  weeklySales: number,
  inventoryLevel: number,
  sku: string = 'unknown',
  alcoholSKU?: AlcoholSKU,
  competitorPrices: CompetitorPrice[] = []
) {
  try {
    // Create enhanced AlcoholSKU with market intelligence
    const skuData: AlcoholSKU = alcoholSKU || convertToAlcoholSKU({
      sku,
      price: currentPrice.toString(),
      weekly_sales: weeklySales.toString(),
      inventory_level: inventoryLevel.toString()
    })
    
    // Get market intelligence analysis
    const productMatch = AlcoholMarketIntelligence.findBestProductMatch(sku)
    
    // Use the alcohol AI engine for analysis
    const aiResult = AlcoholAIEngine.analyzeAlcoholBatch([skuData], competitorPrices)
    const result = aiResult.batch_results[0]
    
    if (!result) {
      return marketIntelligentFallback(currentPrice, weeklySales, inventoryLevel, productMatch, competitorPrices)
    }
    
    const forecast = result.forecast
    let newPrice = currentPrice
    
    // Enhanced price calculation with market context
    if (productMatch.brand && competitorPrices.length > 0) {
      const competitiveAnalysis = AlcoholMarketIntelligence.analyzeCompetitivePosition(
        skuData, 
        productMatch.brand, 
        competitorPrices
      )
      
      // Factor competitive position into pricing recommendation
      if (competitiveAnalysis.price_analysis.vs_competitors > 20) {
        newPrice = currentPrice * 0.95 // Reduce if significantly overpriced
      } else if (competitiveAnalysis.price_analysis.vs_competitors < -15) {
        newPrice = currentPrice * 1.05 // Increase if underpriced vs brand value
      }
    }
    
    // Apply AI forecast adjustments
    switch (forecast.recommendation.action) {
      case 'increase_price':
        newPrice = Math.max(newPrice, currentPrice * 1.05)
        break
      case 'decrease_price':
        newPrice = Math.min(newPrice, currentPrice * 0.95)
        break
      case 'promotional_pricing':
        newPrice = currentPrice * 0.85
        break
      case 'maintain_price':
        // Keep current price but consider market positioning
        break
    }
    
    const changePercentage = ((newPrice - currentPrice) / currentPrice) * 100
    
    return {
      currentPrice,
      recommendedPrice: Math.round(newPrice * 100) / 100,
      changePercentage: Math.round(changePercentage * 100) / 100,
      reason: getMarketIntelligentReason(forecast, productMatch, competitorPrices, inventoryLevel, weeklySales),
      aiInsights: result.ai_insights,
      confidence: forecast.confidence_interval.confidence_level,
      predictedDemand: forecast.predicted_demand,
      trend: forecast.trend,
      seasonalFactor: forecast.seasonality_factor,
      categoryTrend: forecast.category_trend,
      alcoholContext: forecast.alcohol_specific,
      marketIntelligence: productMatch.brand ? {
        brandName: productMatch.brand.name,
        premiumTier: productMatch.brand.premium_tier,
        marketShare: productMatch.brand.market_share_uk,
        brandStrength: productMatch.brand.brand_strength
      } : undefined
    }
  } catch (error) {
    console.error('Enhanced AI recommendation failed, using market fallback:', error)
    const productMatch = AlcoholMarketIntelligence.findBestProductMatch(sku)
    return marketIntelligentFallback(currentPrice, weeklySales, inventoryLevel, productMatch, competitorPrices)
  }
}

function getMarketIntelligentReason(
  forecast: any, 
  productMatch: any, 
  competitorPrices: CompetitorPrice[], 
  inventory: number, 
  weeklySales: number
): string {
  const weeksOfStock = inventory / (weeklySales || 1)
  
  // Brand-specific reasoning
  if (productMatch.brand) {
    const brand = productMatch.brand
    
    if (competitorPrices.length > 0) {
      const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
      const currentPrice = parseFloat(productMatch.brand.typical_price_range.min.toString())
      const priceDiff = ((currentPrice - avgCompPrice) / avgCompPrice) * 100
      
      if (priceDiff > 15) {
        return `${brand.name} (${brand.premium_tier}) priced ${priceDiff.toFixed(1)}% above competitors - consider competitive adjustment`
      }
      if (priceDiff < -15) {
        return `${brand.name} significantly underpriced vs market - ${brand.brand_strength} brand allows premium pricing`
      }
    }
    
    // Seasonal reasoning
    if (brand.seasonal_peaks.includes(getCurrentSeason())) {
      return `${brand.name} entering peak season - optimize pricing for ${brand.premium_tier} positioning`
    }
    
    // Brand strength reasoning
    if (brand.brand_strength === 'growing' && weeksOfStock > 4) {
      return `${brand.name} showing growth momentum - pricing power opportunity`
    }
  }
  
  // Fallback to AI reasoning
  return getAIReason(forecast, inventory, weeklySales)
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 12 || month <= 2) return 'christmas'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 3 && month <= 5) return 'spring'
  return 'autumn'
}

// Market-intelligent fallback when AI fails
function marketIntelligentFallback(
  currentPrice: number, 
  weeklySales: number, 
  inventoryLevel: number, 
  productMatch: any,
  competitorPrices: CompetitorPrice[]
) {
  let recommendedChange = 0
  let reason = "Basic inventory analysis"
  
  const weeksOfStock = inventoryLevel / (weeklySales || 1)
  
  // Use brand intelligence if available
  if (productMatch.brand && competitorPrices.length > 0) {
    const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
    const brandMidPrice = (productMatch.brand.typical_price_range.min + productMatch.brand.typical_price_range.max) / 2
    
    // Compare to both competitors and brand typical price
    const vsCompetitors = ((currentPrice - avgCompPrice) / avgCompPrice) * 100
    const vsBrand = ((currentPrice - brandMidPrice) / brandMidPrice) * 100
    
    if (vsCompetitors > 20) {
      recommendedChange = -0.1 // 10% reduction if way above competitors
      reason = `${productMatch.brand.name} overpriced vs competitors by ${vsCompetitors.toFixed(1)}%`
    } else if (vsCompetitors < -20 && productMatch.brand.premium_tier !== 'value') {
      recommendedChange = 0.08 // 8% increase if underpriced premium brand
      reason = `${productMatch.brand.name} (${productMatch.brand.premium_tier}) underpriced - pricing opportunity`
    }
  } else {
    // Basic inventory-based logic
    if (weeksOfStock < 2) {
      recommendedChange = Math.min(0.05, (2 - weeksOfStock) * 0.025)
      reason = "Low stock - optimize revenue before reorder"
    } else if (weeksOfStock > 8) {
      recommendedChange = Math.max(-0.05, -(weeksOfStock - 8) * 0.01)
      reason = "Overstock situation - promotional pricing recommended"
    }
  }
  
  const newPrice = currentPrice * (1 + recommendedChange)
  
  return {
    currentPrice,
    recommendedPrice: Math.round(newPrice * 100) / 100,
    changePercentage: Math.round(recommendedChange * 10000) / 100,
    reason,
    confidence: productMatch.confidence || 0.5,
    aiInsights: ['Market-intelligent analysis with brand positioning'],
    predictedDemand: Math.round(weeklySales * 4.3),
    trend: 'stable' as const,
    seasonalFactor: 1.0,
    categoryTrend: 'stable' as const,
    marketIntelligence: productMatch.brand ? {
      brandName: productMatch.brand.name,
      premiumTier: productMatch.brand.premium_tier,
      marketShare: productMatch.brand.market_share_uk,
      brandStrength: productMatch.brand.brand_strength
    } : undefined
  }
}

// Keep existing functions for compatibility
function getAIReason(forecast: any, inventory: number, weeklySales: number): string {
  const weeksOfStock = inventory / (weeklySales || 1)
  
  switch (forecast.recommendation.action) {
    case 'increase_price':
      if (forecast.trend === 'increasing') {
        return `Strong upward demand trend (${Math.round(forecast.confidence_interval.confidence_level * 100)}% confidence) - optimize pricing`
      }
      if (forecast.alcohol_specific?.seasonal_peak_in_days && forecast.alcohol_specific.seasonal_peak_in_days < 60) {
        return `Approaching peak season in ${forecast.alcohol_specific.seasonal_peak_in_days} days - seasonal pricing opportunity`
      }
      return `Market positioning allows price increase - low competitive risk`
    
    case 'decrease_price':
      if (weeksOfStock > 8) {
        return `Overstock detected (${weeksOfStock.toFixed(1)} weeks) - promotional pricing recommended`
      }
      if (forecast.alcohol_specific?.competitor_price_position === 'lagging') {
        return `Competitors pricing significantly lower - adjust for competitiveness`
      }
      return `Declining demand trend - stimulate sales with lower price`
    
    case 'promotional_pricing':
      if (forecast.alcohol_specific?.seasonal_peak_in_days && forecast.alcohol_specific.seasonal_peak_in_days > 180) {
        return `Off-season detected - promotional pricing to move inventory`
      }
      return `Excess inventory with expiration risk - aggressive promotion needed`
    
    case 'reorder_stock':
      if (forecast.alcohol_specific?.seasonal_peak_in_days && forecast.alcohol_specific.seasonal_peak_in_days < 30) {
        return `Peak season approaching - critical reorder to avoid stockouts`
      }
      return `Critical stock shortage predicted - immediate reordering required`
    
    default:
      return `AI analysis suggests maintaining current price (${Math.round(forecast.confidence_interval.confidence_level * 100)}% confidence)`
  }
}

// Enhanced inventory risk assessment remains the same but with market context
export function assessInventoryRisk(
  inventoryLevel: number,
  weeklySales: number,
  sku: string,
  alcoholSKU?: AlcoholSKU
) {
  // Your existing assessInventoryRisk function code stays the same
  try {
    const skuData: AlcoholSKU = alcoholSKU || convertToAlcoholSKU({
      sku,
      price: '0',
      weekly_sales: weeklySales.toString(),
      inventory_level: inventoryLevel.toString()
    })
    
    const aiResult = AlcoholAIEngine.analyzeAlcoholBatch([skuData])
    const result = aiResult.batch_results[0]
    
    const velocity = weeklySales || 0.1
    const weeksOfStock = inventoryLevel / velocity
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'none' = 'none'
    let priority = 0
    
    // Enhanced risk assessment with alcohol-specific factors
    if (weeksOfStock < 1.5) {
      riskLevel = 'high'
      riskType = 'stockout'
      priority = 10 - weeksOfStock
    } else if (weeksOfStock < 3) {
      riskLevel = 'medium'
      riskType = 'stockout'
      priority = 7 - weeksOfStock
    } else if (weeksOfStock > 12) {
      if (skuData.shelf_life_days && (weeksOfStock * 7) > (skuData.shelf_life_days * 0.7)) {
        riskLevel = 'high'
        riskType = 'expiration'
        priority = weeksOfStock / 1.5
      } else {
        riskLevel = 'high'
        riskType = 'overstock'
        priority = weeksOfStock / 2
      }
    } else if (weeksOfStock > 8) {
      riskLevel = 'medium'
      riskType = 'overstock'
      priority = weeksOfStock / 3
    }
    
    // Check for seasonal risks
    if (result?.forecast?.alcohol_specific?.seasonal_peak_in_days && 
        result.forecast.alcohol_specific.seasonal_peak_in_days < 30 && 
        weeksOfStock < 4) {
      riskLevel = 'high'
      riskType = 'seasonal_shortage'
      priority = 9
    }
    
    // Enhance with AI insights if available
    let message = getRiskMessage(riskType, weeksOfStock, riskLevel, skuData)
    if (result?.forecast) {
      const predictedDemand = result.forecast.predicted_demand
      const confidence = result.forecast.confidence_interval.confidence_level
      message += ` (AI predicts ${predictedDemand} units demand, ${Math.round(confidence * 100)}% confidence)`
    }
    
    return {
      sku,
      riskLevel,
      riskType,
      weeksOfStock: Math.round(weeksOfStock * 10) / 10,
      priority,
      message,
      aiEnhanced: !!result?.forecast,
      alcoholContext: {
        category: skuData.category,
        shelfLifeDays: skuData.shelf_life_days,
        seasonalPeak: skuData.seasonal_peak
      }
    }
  } catch (error) {
    console.error('AI risk assessment failed, using basic assessment:', error)
    return basicRiskAssessment(inventoryLevel, weeklySales, sku)
  }
}

function basicRiskAssessment(inventoryLevel: number, weeklySales: number, sku: string) {
  const velocity = weeklySales || 0.1
  const weeksOfStock = inventoryLevel / velocity
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  let riskType: 'stockout' | 'overstock' | 'none' = 'none'
  
  if (weeksOfStock < 2) {
    riskLevel = 'high'
    riskType = 'stockout'
  } else if (weeksOfStock > 10) {
    riskLevel = 'medium'
    riskType = 'overstock'
  }
  
  return {
    sku,
    riskLevel,
    riskType,
    weeksOfStock: Math.round(weeksOfStock * 10) / 10,
    priority: riskType === 'stockout' ? 8 : 3,
    message: getRiskMessage(riskType, weeksOfStock, riskLevel),
    aiEnhanced: false
  }
}

function getRiskMessage(
  riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'none',
  weeksOfStock: number,
  riskLevel: 'low' | 'medium' | 'high',
  alcoholSKU?: AlcoholSKU
): string {
  if (riskType === 'stockout') {
    if (riskLevel === 'high') return `Critical: Only ${weeksOfStock.toFixed(1)} weeks of stock remaining`
    return `Warning: ${weeksOfStock.toFixed(1)} weeks of stock remaining`
  }
  if (riskType === 'expiration') {
    const shelfLife = alcoholSKU?.shelf_life_days || 365
    return `Expiration risk: ${weeksOfStock.toFixed(1)} weeks of stock with ${Math.round(shelfLife / 7)} week shelf life`
  }
  if (riskType === 'seasonal_shortage') {
    return `Seasonal risk: Insufficient inventory for upcoming ${alcoholSKU?.seasonal_peak || 'peak'} season`
  }
  if (riskType === 'overstock') {
    if (riskLevel === 'high') return `Overstock: ${weeksOfStock.toFixed(1)} weeks of excess inventory`
    return `Slow moving: ${weeksOfStock.toFixed(1)} weeks of stock`
  }
  return 'Optimal stock levels'
}
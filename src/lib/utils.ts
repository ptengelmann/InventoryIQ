import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AIEngine } from './ai-engine'

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

// Enhanced AI-powered price recommendation
export function calculatePriceRecommendation(
  currentPrice: number,
  weeklySales: number,
  inventoryLevel: number,
  sku: string = 'unknown'
) {
  // Use the real AI engine for analysis
  const skuData = [{
    sku,
    currentPrice,
    currentInventory: inventoryLevel,
    weeklySales
  }]
  
  const aiResult = AIEngine.analyzeBatch(skuData)
  const result = aiResult.batch_results[0]
  
  if (!result) {
    // Fallback to simple logic if AI fails
    return simpleRecommendation(currentPrice, weeklySales, inventoryLevel)
  }
  
  const forecast = result.forecast
  let newPrice = currentPrice
  
  switch (forecast.recommendation.action) {
    case 'increase_price':
      newPrice = currentPrice * 1.05 // 5% increase
      break
    case 'decrease_price':
      newPrice = currentPrice * 0.95 // 5% decrease
      break
    case 'maintain_price':
      newPrice = currentPrice
      break
    case 'reorder_stock':
      newPrice = currentPrice // Keep price same, focus on restocking
      break
  }
  
  const changePercentage = ((newPrice - currentPrice) / currentPrice) * 100
  
  return {
    currentPrice,
    recommendedPrice: Math.round(newPrice * 100) / 100,
    changePercentage: Math.round(changePercentage * 100) / 100,
    reason: getAIReason(forecast, inventoryLevel, weeklySales),
    aiInsights: result.ai_insights,
    confidence: forecast.confidence_interval.confidence_level,
    predictedDemand: forecast.predicted_demand,
    trend: forecast.trend
  }
}

function getAIReason(forecast: any, inventory: number, weeklySales: number): string {
  const weeksOfStock = inventory / (weeklySales || 1)
  
  switch (forecast.recommendation.action) {
    case 'increase_price':
      if (forecast.trend === 'increasing') {
        return `Strong upward demand trend (${Math.round(forecast.confidence_interval.confidence_level * 100)}% confidence) - optimize pricing`
      }
      return `Low stock situation - increase price to manage demand`
    
    case 'decrease_price':
      if (weeksOfStock > 8) {
        return `Overstock detected (${weeksOfStock.toFixed(1)} weeks) - promotional pricing recommended`
      }
      return `Declining demand trend - stimulate sales with lower price`
    
    case 'reorder_stock':
      return `Critical stock shortage predicted - immediate reordering required`
    
    default:
      return `AI analysis suggests maintaining current price (${Math.round(forecast.confidence_interval.confidence_level * 100)}% confidence)`
  }
}

// Fallback simple recommendation
function simpleRecommendation(currentPrice: number, weeklySales: number, inventoryLevel: number) {
  const salesVelocity = weeklySales
  const weeksOfStock = inventoryLevel / (salesVelocity || 1)
  
  let recommendedChange = 0
  
  if (weeksOfStock < 2) {
    recommendedChange = Math.min(0.05, (2 - weeksOfStock) * 0.025)
  } else if (weeksOfStock > 8) {
    recommendedChange = Math.max(-0.05, -(weeksOfStock - 8) * 0.01)
  } else if (salesVelocity > 10) {
    recommendedChange = 0.02
  }
  
  const newPrice = currentPrice * (1 + recommendedChange)
  
  return {
    currentPrice,
    recommendedPrice: Math.round(newPrice * 100) / 100,
    changePercentage: Math.round(recommendedChange * 10000) / 100,
    reason: getSimpleReason(weeksOfStock, salesVelocity, recommendedChange),
    confidence: 0.7,
    aiInsights: ['Basic analysis - upgrade to AI for advanced insights'],
    predictedDemand: Math.round(weeklySales * 4.3), // Rough monthly estimate
    trend: 'stable' as const
  }
}

function getSimpleReason(weeksOfStock: number, salesVelocity: number, change: number): string {
  if (change > 0.03) return "High demand, low stock - optimize revenue"
  if (change > 0) return "Good performance - small price increase"
  if (change < -0.03) return "Overstock situation - boost sales"
  if (change < 0) return "Slow movement - price reduction recommended"
  return "Optimal pricing - maintain current price"
}

// Enhanced inventory risk assessment with AI
export function assessInventoryRisk(
  inventoryLevel: number,
  weeklySales: number,
  sku: string
) {
  // Use AI for more sophisticated risk assessment
  const skuData = [{
    sku,
    currentPrice: 0, // Not needed for risk assessment
    currentInventory: inventoryLevel,
    weeklySales
  }]
  
  const aiResult = AIEngine.analyzeBatch(skuData)
  const result = aiResult.batch_results[0]
  
  const velocity = weeklySales || 0.1
  const weeksOfStock = inventoryLevel / velocity
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  let riskType: 'stockout' | 'overstock' | 'none' = 'none'
  let priority = 0
  
  if (weeksOfStock < 1.5) {
    riskLevel = 'high'
    riskType = 'stockout'
    priority = 10 - weeksOfStock
  } else if (weeksOfStock < 3) {
    riskLevel = 'medium'
    riskType = 'stockout'
    priority = 7 - weeksOfStock
  } else if (weeksOfStock > 12) {
    riskLevel = 'high'
    riskType = 'overstock'
    priority = weeksOfStock / 2
  } else if (weeksOfStock > 8) {
    riskLevel = 'medium'
    riskType = 'overstock'
    priority = weeksOfStock / 3
  }
  
  // Enhance with AI insights if available
  let message = getRiskMessage(riskType, weeksOfStock, riskLevel)
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
    aiEnhanced: !!result?.forecast
  }
}

function getRiskMessage(
  riskType: 'stockout' | 'overstock' | 'none',
  weeksOfStock: number,
  riskLevel: 'low' | 'medium' | 'high'
): string {
  if (riskType === 'stockout') {
    if (riskLevel === 'high') return `Critical: Only ${weeksOfStock.toFixed(1)} weeks of stock remaining`
    return `Warning: ${weeksOfStock.toFixed(1)} weeks of stock remaining`
  }
  if (riskType === 'overstock') {
    if (riskLevel === 'high') return `Overstock: ${weeksOfStock.toFixed(1)} weeks of excess inventory`
    return `Slow moving: ${weeksOfStock.toFixed(1)} weeks of stock`
  }
  return 'Optimal stock levels'
}
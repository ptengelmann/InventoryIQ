import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Price recommendation logic (basic AI simulation for MVP)
export function calculatePriceRecommendation(
  currentPrice: number,
  weeklySales: number,
  inventoryLevel: number
) {
  const salesVelocity = weeklySales
  const weeksOfStock = inventoryLevel / (salesVelocity || 1)
  
  let recommendedChange = 0
  
  // Basic pricing logic
  if (weeksOfStock < 2) {
    // Low stock, potentially increase price
    recommendedChange = Math.min(0.05, (2 - weeksOfStock) * 0.025)
  } else if (weeksOfStock > 8) {
    // High stock, potentially decrease price
    recommendedChange = Math.max(-0.05, -(weeksOfStock - 8) * 0.01)
  } else if (salesVelocity > 10) {
    // High sales velocity, can increase price slightly
    recommendedChange = 0.02
  }
  
  const newPrice = currentPrice * (1 + recommendedChange)
  
  return {
    currentPrice,
    recommendedPrice: Math.round(newPrice * 100) / 100,
    changePercentage: Math.round(recommendedChange * 10000) / 100,
    reason: getRecommendationReason(weeksOfStock, salesVelocity, recommendedChange)
  }
}

function getRecommendationReason(
  weeksOfStock: number, 
  salesVelocity: number, 
  change: number
): string {
  if (change > 0.03) return "High demand, low stock - optimize revenue"
  if (change > 0) return "Good performance - small price increase"
  if (change < -0.03) return "Overstock situation - boost sales"
  if (change < 0) return "Slow movement - price reduction recommended"
  return "Optimal pricing - maintain current price"
}

// Inventory risk assessment
export function assessInventoryRisk(
  inventoryLevel: number,
  weeklySales: number,
  sku: string
) {
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
  
  return {
    sku,
    riskLevel,
    riskType,
    weeksOfStock: Math.round(weeksOfStock * 10) / 10,
    priority,
    message: getRiskMessage(riskType, weeksOfStock, riskLevel)
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
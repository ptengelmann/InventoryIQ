export interface CSVRow {
  sku: string
  price: string
  weekly_sales: string
  inventory_level: string
  [key: string]: string
}

export interface PriceRecommendation {
  sku: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  reason: string
  weeklySales: number
  inventoryLevel: number
}

export interface InventoryAlert {
  sku: string
  riskLevel: 'low' | 'medium' | 'high'
  riskType: 'stockout' | 'overstock' | 'none'
  weeksOfStock: number
  priority: number
  message: string
}

export interface AnalysisSummary {
  totalSKUs: number
  priceIncreases: number
  priceDecreases: number
  noChange: number
  highRiskSKUs: number
  mediumRiskSKUs: number
  totalRevenuePotential: number
}
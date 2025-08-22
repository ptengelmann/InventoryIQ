// REPLACE: /src/types/index.ts
// Enhanced types for alcohol industry vertical

export interface CSVRow {
  sku: string
  price: string
  weekly_sales: string
  inventory_level: string
  [key: string]: string
}

// Enhanced alcohol-specific SKU interface
export interface AlcoholSKU {
  // Core CSV fields
  sku: string
  price: string
  weekly_sales: string
  inventory_level: string
  
  // Alcohol-specific fields
  category: 'beer' | 'wine' | 'spirits' | 'rtd' | 'cider' | 'sake' | 'mead'
  subcategory: string // IPA, Bourbon, Chardonnay, Hard Seltzer, etc.
  brand: string
  abv: number
  volume_ml: number
  container_type: 'bottle' | 'can' | 'keg' | 'box' | 'pouch'
  seasonal_peak?: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'year_round'
  shelf_life_days?: number
  distributor: string
  state_restrictions?: string[]
  origin_country?: string
  origin_region?: string
  vintage_year?: number
  organic?: boolean
  gluten_free?: boolean
  craft?: boolean
  import_cost?: number
  excise_tax?: number
  
  // Allow additional string properties for CSV compatibility
  [key: string]: string | number | boolean | string[] | undefined
}

// Competitor pricing data
export interface CompetitorPrice {
  sku: string
  upc?: string
  competitor: string
  competitor_price: number
  our_price: number
  price_difference: number
  price_difference_percentage: number
  availability: boolean
  last_updated: Date
  source: 'wine_com' | 'total_wine' | 'local_store' | 'distributor' | 'manual' | 'api'
  url?: string
  promotional?: boolean
  promotion_details?: string
}

// Market trend data
export interface MarketTrend {
  category: string
  subcategory?: string
  trend_type: 'price' | 'volume' | 'new_entrants' | 'seasonal'
  direction: 'increasing' | 'decreasing' | 'stable'
  magnitude: number // percentage change
  confidence: number
  time_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  data_source: string
  detected_at: Date
}

// Enhanced pricing recommendation for alcohol
export interface AlcoholPriceRecommendation {
  sku: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  reason: string
  weeklySales: number
  inventoryLevel: number
  category: string
  subcategory: string
  competitor_context?: {
    lowest_competitor_price: number
    highest_competitor_price: number
    average_competitor_price: number
    our_ranking: number // 1 = cheapest, higher = more expensive
  }
  seasonal_context?: {
    current_season: string
    peak_season_multiplier: number
    days_to_peak: number
  }
  regulatory_context?: {
    min_price_allowed: number
    max_markup_allowed: number
    tax_implications: number
  }
}

// Enhanced inventory alerts for alcohol
export interface AlcoholInventoryAlert {
  sku: string
  category: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'competitor_advantage' | 'compliance'
  weeksOfStock: number
  priority: number
  message: string
  action_required: string
  compliance_notes?: string
  seasonal_impact?: boolean
  competitor_threat?: boolean
  expiration_date?: Date
  reorder_recommendation?: {
    quantity: number
    urgency: 'immediate' | 'within_week' | 'within_month'
    supplier_lead_time: number
  }
}

// Compliance tracking
export interface ComplianceRecord {
  id: string
  state: string
  regulation_type: 'volume_reporting' | 'tax_filing' | 'license_renewal' | 'label_approval'
  threshold_value?: number
  current_value?: number
  due_date: Date
  status: 'compliant' | 'approaching_threshold' | 'overdue' | 'filing_required'
  penalty_risk?: number
  last_filed?: Date
}

// Enhanced analysis summary for alcohol
export interface AlcoholAnalysisSummary {
  totalSKUs: number
  priceIncreases: number
  priceDecreases: number
  noChange: number
  highRiskSKUs: number
  mediumRiskSKUs: number
  totalRevenuePotential: number
  
  // Alcohol-specific metrics
  by_category: {
    [category: string]: {
      sku_count: number
      revenue_potential: number
      avg_price_change: number
      high_risk_count: number
    }
  }
  seasonal_opportunities: {
    category: string
    revenue_potential: number
    recommended_action: string
  }[]
  competitor_threats: {
    sku: string
    threat_level: 'low' | 'medium' | 'high'
    price_disadvantage: number
  }[]
  compliance_status: {
    total_regulations: number
    compliant: number
    approaching_deadline: number
    overdue: number
  }
  market_position: {
    categories_leading: string[]
    categories_lagging: string[]
    overall_competitiveness: number // 0-100 score
  }
}

// External data integration types
export interface ExternalDataSource {
  id: string
  name: string
  type: 'api' | 'scraper' | 'file_import' | 'manual'
  category: 'pricing' | 'inventory' | 'trends' | 'compliance' | 'news'
  endpoint?: string
  schedule: 'real_time' | 'hourly' | 'daily' | 'weekly'
  last_updated?: Date
  status: 'active' | 'inactive' | 'error'
  error_message?: string
}

// AI insights for alcohol industry
export interface AlcoholInsight {
  id: string
  type: 'pricing' | 'inventory' | 'market_trend' | 'competitor' | 'seasonal' | 'compliance'
  title: string
  description: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  revenue_impact?: number
  time_sensitive: boolean
  action_items: string[]
  related_skus: string[]
  generated_at: Date
}

// Legacy compatibility
export interface PriceRecommendation extends AlcoholPriceRecommendation {}
export interface InventoryAlert extends AlcoholInventoryAlert {}
export interface AnalysisSummary extends AlcoholAnalysisSummary {}
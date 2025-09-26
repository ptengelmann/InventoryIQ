// src/lib/intelligent-cost-optimization.ts
// Claude-only cost optimization for competitive intelligence

import { RealCompetitiveScraping } from './real-competitive-scraping'

// Simple type definitions
interface AlcoholSKU {
  sku_code: string
  product_name?: string
  brand?: string
  subcategory?: string
  category: string
  price: number
  weekly_sales: number
  inventory_level: number
}

interface CompetitorPrice {
  sku: string
  competitor: string
  competitor_price: number
  our_price: number
  price_difference: number
  price_difference_percentage: number
  availability: boolean
  last_updated: Date
  source: string
  url?: string
  product_name?: string
  relevance_score?: number
  promotional?: boolean
  promotion_details?: string
}

interface CostBudget {
  monthly_budget_gbp: number
  claude_cost_per_1k_tokens: number
  scraping_cost_per_request: number
}

interface OptimizedAnalysisRequest {
  skus: AlcoholSKU[]
  budget_remaining: number
  priority_categories: string[]
  max_skus_to_analyze?: number
}

interface PrioritizedSKU extends AlcoholSKU {
  priority_score: number
}

export class IntelligentCostOptimization {
  
  private static COST_CONFIG: CostBudget = {
    monthly_budget_gbp: 200,
    claude_cost_per_1k_tokens: 0.008,  // Claude Sonnet 3.5 pricing
    scraping_cost_per_request: 0.02    // Estimated scraping cost
  }

  /**
   * Optimized competitive analysis using only Claude
   */
  static async optimizedCompetitiveAnalysis(
    request: OptimizedAnalysisRequest
  ): Promise<{
    competitive_data: CompetitorPrice[]
    cost_breakdown: {
      total_cost_gbp: number
      claude_cost: number
      scraping_cost: number
      budget_remaining: number
      skus_analyzed: number
      skus_skipped: number
    }
    priority_insights: any[]
  }> {
    const startTime = Date.now()
    let claudeCost = 0
    let scrapingCost = 0
    
    console.log(`Starting optimized analysis for ${request.skus.length} SKUs`)
    console.log(`Budget remaining: £${request.budget_remaining}`)
    
    // Step 1: Smart SKU prioritization
    const prioritizedSKUs = this.prioritizeSKUsForAnalysis(request.skus, request.priority_categories)
    const selectedSKUs = this.selectSKUsWithinBudget(prioritizedSKUs, request.budget_remaining, request.max_skus_to_analyze)
    
    console.log(`Selected ${selectedSKUs.length} high-priority SKUs for analysis`)
    
    // Step 2: Collect competitive data efficiently
    const competitorData: CompetitorPrice[] = []
    let skusAnalyzed = 0
    let skusSkipped = 0
    
    for (const sku of selectedSKUs) {
      try {
        // Check budget before each scraping request
        const estimatedCost = scrapingCost + this.COST_CONFIG.scraping_cost_per_request
        if (estimatedCost > request.budget_remaining * 0.8) {
          console.log(`Budget limit approaching, skipping remaining ${selectedSKUs.length - skusAnalyzed} SKUs`)
          skusSkipped = selectedSKUs.length - skusAnalyzed
          break
        }

        // Use the new scrapeWithProductContext method
        const skuCompetitors = await RealCompetitiveScraping.scrapeWithProductContext({
          sku_code: sku.sku_code,
          product_name: sku.product_name,
          brand: sku.brand,
          subcategory: sku.subcategory,
          category: sku.category,
          price: sku.price,
          weekly_sales: sku.weekly_sales
        }, 3, false) // Max 3 retailers per SKU, no AI insights to save costs
        
        // Calculate price differences
        const enhancedCompetitors = skuCompetitors.map(competitor => ({
          ...competitor,
          our_price: sku.price,
          price_difference: competitor.competitor_price - sku.price,
          price_difference_percentage: ((competitor.competitor_price - sku.price) / sku.price) * 100
        }))
        
        competitorData.push(...enhancedCompetitors)
        scrapingCost += this.COST_CONFIG.scraping_cost_per_request
        skusAnalyzed++
        
        // Rate limiting to avoid overwhelming SERP API
        await this.delay(800)
        
      } catch (error) {
        console.error(`Failed to analyze ${sku.sku_code}:`, error)
        skusSkipped++
      }
    }
    
    // Step 3: Generate priority insights using business logic (no Claude API calls needed)
    const priorityInsights = this.generatePriorityInsights(selectedSKUs, competitorData)
    
    const totalCost = claudeCost + scrapingCost
    
    console.log(`Analysis complete in ${Date.now() - startTime}ms`)
    console.log(`Total cost: £${totalCost.toFixed(3)} (Scraping: £${scrapingCost.toFixed(3)})`)
    
    return {
      competitive_data: competitorData,
      cost_breakdown: {
        total_cost_gbp: totalCost,
        claude_cost: claudeCost,
        scraping_cost: scrapingCost,
        budget_remaining: request.budget_remaining - totalCost,
        skus_analyzed: skusAnalyzed,
        skus_skipped: skusSkipped
      },
      priority_insights: priorityInsights
    }
  }

  /**
   * Smart SKU prioritization based on business impact
   */
  private static prioritizeSKUsForAnalysis(
    skus: AlcoholSKU[],
    priorityCategories: string[]
  ): PrioritizedSKU[] {
    return skus
      .map(sku => ({
        ...sku,
        priority_score: this.calculatePriorityScore(sku, priorityCategories)
      }))
      .sort((a, b) => b.priority_score - a.priority_score)
  }

  /**
   * Calculate business priority score for each SKU
   */
  private static calculatePriorityScore(sku: AlcoholSKU, priorityCategories: string[]): number {
    let score = 0
    
    // Revenue impact (weekly sales * price)
    const weeklyRevenue = sku.weekly_sales * sku.price
    score += weeklyRevenue * 2 // High weight on revenue
    
    // Inventory value risk
    const inventoryValue = sku.inventory_level * sku.price
    score += inventoryValue * 0.01
    
    // Category priority boost
    if (priorityCategories.includes(sku.category)) {
      score += 1000
    }
    
    // High-value product boost
    if (sku.price > 30) {
      score += 500
    }
    
    // Fast-moving product boost
    if (sku.weekly_sales > 5) {
      score += 300
    }
    
    // Stock risk (low stock = higher priority)
    const weeksOfStock = sku.inventory_level / Math.max(sku.weekly_sales, 0.1)
    if (weeksOfStock < 4) {
      score += 200
    }
    
    // Slow mover with high inventory (liquidation priority)
    if (sku.weekly_sales < 1 && inventoryValue > 200) {
      score += 400
    }
    
    return Math.round(score)
  }

  /**
   * Select SKUs within budget constraints
   */
  private static selectSKUsWithinBudget(
    prioritizedSKUs: PrioritizedSKU[],
    budgetRemaining: number,
    maxSKUs?: number
  ): PrioritizedSKU[] {
    const estimatedCostPerSKU = this.COST_CONFIG.scraping_cost_per_request
    const budgetBasedLimit = Math.floor(budgetRemaining / estimatedCostPerSKU)
    
    const limit = maxSKUs ? Math.min(maxSKUs, budgetBasedLimit) : budgetBasedLimit
    const cappedLimit = Math.min(limit, 25) // Cap at 25 SKUs to prevent runaway costs
    
    console.log(`Budget allows ${budgetBasedLimit} SKUs, selecting top ${cappedLimit}`)
    
    return prioritizedSKUs.slice(0, cappedLimit)
  }

  /**
   * Generate business insights without expensive AI calls
   */
  private static generatePriorityInsights(
    analyzedSKUs: PrioritizedSKU[],
    competitorData: CompetitorPrice[]
  ): any[] {
    const insights = []
    
    // Pricing insights
    const overpriced = analyzedSKUs.filter(sku => {
      const competitors = competitorData.filter(c => c.sku === sku.sku_code)
      if (competitors.length === 0) return false
      const avgCompPrice = competitors.reduce((sum, c) => sum + c.competitor_price, 0) / competitors.length
      return sku.price > avgCompPrice * 1.15
    })
    
    const underpriced = analyzedSKUs.filter(sku => {
      const competitors = competitorData.filter(c => c.sku === sku.sku_code)
      if (competitors.length === 0) return false
      const avgCompPrice = competitors.reduce((sum, c) => sum + c.competitor_price, 0) / competitors.length
      return sku.price < avgCompPrice * 0.85
    })
    
    // Stock insights
    const stockRisks = analyzedSKUs.filter(sku => {
      const weeksOfStock = sku.inventory_level / Math.max(sku.weekly_sales, 0.1)
      return weeksOfStock < 2
    })
    
    const slowMovers = analyzedSKUs.filter(sku => 
      sku.weekly_sales < 1 && (sku.inventory_level * sku.price) > 200
    )
    
    // Generate actionable insights
    if (overpriced.length > 0) {
      const totalRevenuAtRisk = overpriced.reduce((sum, sku) => 
        sum + (sku.weekly_sales * sku.price * 52), 0
      )
      
      insights.push({
        type: 'pricing_alert',
        priority: 'high',
        title: `${overpriced.length} products overpriced vs competitors`,
        description: `Annual revenue at risk: £${Math.round(totalRevenuAtRisk).toLocaleString()}`,
        affected_skus: overpriced.map(s => s.sku_code),
        immediate_actions: [
          'Review pricing for top 5 overpriced products',
          'Consider promotional pricing to match competitors',
          'Analyze cost structure for price reduction opportunities'
        ],
        estimated_impact: Math.round(totalRevenuAtRisk * 0.1) // 10% revenue recovery
      })
    }
    
    if (underpriced.length > 0) {
      const totalOpportunity = underpriced.reduce((sum, sku) => {
        const competitors = competitorData.filter(c => c.sku === sku.sku_code)
        if (competitors.length === 0) return sum
        const avgCompPrice = competitors.reduce((s, c) => s + c.competitor_price, 0) / competitors.length
        const priceGap = avgCompPrice - sku.price
        return sum + (priceGap * sku.weekly_sales * 52)
      }, 0)
      
      insights.push({
        type: 'revenue_opportunity',
        priority: 'medium',
        title: `${underpriced.length} products underpriced - revenue opportunity`,
        description: `Annual revenue opportunity: £${Math.round(totalOpportunity).toLocaleString()}`,
        affected_skus: underpriced.map(s => s.sku_code),
        immediate_actions: [
          'Test price increases on underpriced products',
          'Monitor competitor pricing changes',
          'Implement dynamic pricing strategy'
        ],
        estimated_impact: Math.round(totalOpportunity * 0.5) // 50% price increase adoption
      })
    }
    
    if (stockRisks.length > 0) {
      insights.push({
        type: 'stock_alert',
        priority: 'critical',
        title: `${stockRisks.length} products at risk of stockout`,
        description: 'Products with less than 2 weeks of inventory',
        affected_skus: stockRisks.map(s => s.sku_code),
        immediate_actions: [
          'Place urgent reorders for at-risk products',
          'Consider temporary price increases to slow demand',
          'Identify substitute products for customers'
        ],
        estimated_impact: stockRisks.reduce((sum, sku) => 
          sum + (sku.weekly_sales * sku.price * 4), 0 // 4 weeks of lost sales
        )
      })
    }
    
    if (slowMovers.length > 0) {
      insights.push({
        type: 'liquidation_opportunity',
        priority: 'medium',
        title: `${slowMovers.length} slow-moving products with high inventory value`,
        description: 'Consider promotional strategies to move inventory',
        affected_skus: slowMovers.map(s => s.sku_code),
        immediate_actions: [
          'Create bundled offers with slow-moving products',
          'Implement progressive discount strategy',
          'Consider B2B bulk sales opportunities'
        ],
        estimated_impact: slowMovers.reduce((sum, sku) => 
          sum + (sku.inventory_level * sku.price * 0.1), 0 // 10% inventory value recovery
        )
      })
    }
    
    return insights
  }

  /**
   * Check monthly budget status
   */
  static async checkBudgetStatus(userId: string): Promise<{
    monthly_spent: number
    budget_remaining: number
    recommendations: string[]
  }> {
    // In a real implementation, this would query your database
    const monthlySpent = 0 // Query from your usage tracking
    const budgetRemaining = this.COST_CONFIG.monthly_budget_gbp - monthlySpent
    
    const recommendations = []
    if (budgetRemaining < 50) {
      recommendations.push('Budget running low - prioritize only high-value SKUs')
    }
    if (budgetRemaining < 20) {
      recommendations.push('Critical: Less than £20 budget remaining')
    }
    
    return {
      monthly_spent: monthlySpent,
      budget_remaining: budgetRemaining,
      recommendations
    }
  }

  /**
   * Get estimated cost for analyzing specific SKUs
   */
  static estimateAnalysisCost(skuCount: number): {
    estimated_cost_gbp: number
    max_skus_within_budget: number
    recommendation: string
  } {
    const estimatedCost = skuCount * this.COST_CONFIG.scraping_cost_per_request
    const maxSKUs = Math.floor(this.COST_CONFIG.monthly_budget_gbp / this.COST_CONFIG.scraping_cost_per_request)
    
    let recommendation = ''
    if (skuCount > 25) {
      recommendation = 'Consider analyzing in batches to optimize costs'
    } else if (estimatedCost > 50) {
      recommendation = 'High cost analysis - ensure high-value SKUs are prioritized'
    } else {
      recommendation = 'Cost-efficient analysis size'
    }
    
    return {
      estimated_cost_gbp: estimatedCost,
      max_skus_within_budget: maxSKUs,
      recommendation
    }
  }

  /**
   * Simple delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
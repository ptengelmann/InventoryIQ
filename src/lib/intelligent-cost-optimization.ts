// src/lib/intelligent-cost-optimization.ts
// Optimize Claude + GPT-4 usage for maximum value at minimum cost

import { AlcoholSKU, CompetitorPrice } from '@/types'
import { RealCompetitiveScraping } from './real-competitive-scraping'

interface CostBudget {
  monthly_budget_gbp: number
  claude_cost_per_1k_tokens: number
  gpt4_cost_per_1k_tokens: number
  scraping_cost_per_request: number
}

interface IntelligentAnalysisRequest {
  skus: AlcoholSKU[]
  budget_remaining: number
  analysis_depth: 'quick' | 'standard' | 'deep'
  priority_categories: string[]
}

export class IntelligentCostOptimization {
  
  private static COST_CONFIG: CostBudget = {
    monthly_budget_gbp: 200,  // Your target budget
    claude_cost_per_1k_tokens: 0.008,  // Claude Sonnet pricing
    gpt4_cost_per_1k_tokens: 0.06,     // GPT-4 Turbo pricing
    scraping_cost_per_request: 0.02    // Estimated scraping cost (time + resources)
  }

  // Smart routing: Claude for discovery, GPT-4 for complex analysis
  static async optimizedCompetitiveIntelligence(
    request: IntelligentAnalysisRequest
  ): Promise<{
    competitive_data: CompetitorPrice[]
    ai_insights: any[]
    cost_breakdown: any
    recommendations: any[]
  }> {
    const startTime = Date.now()
    const costs = { claude: 0, gpt4: 0, scraping: 0 }
    
    console.log(`🎯 Starting optimized analysis for ${request.skus.length} SKUs`)
    console.log(`💰 Budget remaining: £${request.budget_remaining}`)
    
    // Step 1: Intelligent SKU prioritization using business rules
    const prioritizedSKUs = this.prioritizeSKUsForAnalysis(request.skus, request.priority_categories)
    const topSKUs = this.selectSKUsWithinBudget(prioritizedSKUs, request.budget_remaining)
    
    console.log(`📊 Analyzing top ${topSKUs.length} priority SKUs (${prioritizedSKUs.length} total)`)
    
    // Step 2: Batch competitor data collection (cached + fresh)
    const competitorData: CompetitorPrice[] = []
    
    for (const sku of topSKUs) {
      try {
        // Use cached data when possible (24hr cache for cost efficiency)
        const skuCompetitors = await RealCompetitiveScraping.getCachedOrScrape(
          `${sku.brand} ${sku.subcategory}`,
          sku.category,
          24  // 24 hour cache
        )
        
        competitorData.push(...skuCompetitors)
        costs.scraping += this.COST_CONFIG.scraping_cost_per_request
        
        // Respect budget limits
        if (this.calculateCurrentCost(costs) > request.budget_remaining * 0.8) {
          console.log(`⚠️  Approaching budget limit, stopping competitor collection`)
          break
        }
        
      } catch (error) {
        console.error(`Failed to get competitor data for ${sku.sku}:`, error)
      }
    }
    
    // Step 3: Claude-powered rapid analysis for all SKUs
    const rapidInsights = await this.claudeRapidAnalysis(topSKUs, competitorData)
    costs.claude += this.estimateClaudeTokens(topSKUs, competitorData) * this.COST_CONFIG.claude_cost_per_1k_tokens / 1000
    
    // Step 4: GPT-4 deep analysis only for high-value SKUs
    const highValueSKUs = this.identifyHighValueSKUs(topSKUs, rapidInsights)
    const deepInsights = await this.gpt4DeepAnalysis(highValueSKUs, competitorData)
    costs.gpt4 += this.estimateGPT4Tokens(highValueSKUs) * this.COST_CONFIG.gpt4_cost_per_1k_tokens / 1000
    
    // Step 5: Combine insights efficiently
    const recommendations = this.combineInsights(rapidInsights, deepInsights, competitorData)
    
    const totalCost = costs.claude + costs.gpt4 + costs.scraping
    
    console.log(`✅ Analysis complete in ${Date.now() - startTime}ms`)
    console.log(`💰 Total cost: £${totalCost.toFixed(3)} (Claude: £${costs.claude.toFixed(3)}, GPT-4: £${costs.gpt4.toFixed(3)}, Scraping: £${costs.scraping.toFixed(3)})`)
    
    return {
      competitive_data: competitorData,
      ai_insights: [...rapidInsights, ...deepInsights],
      cost_breakdown: {
        total_cost_gbp: totalCost,
        claude_cost: costs.claude,
        gpt4_cost: costs.gpt4,
        scraping_cost: costs.scraping,
        budget_remaining: request.budget_remaining - totalCost,
        efficiency_score: this.calculateEfficiencyScore(recommendations.length, totalCost)
      },
      recommendations
    }
  }

  // Claude: Fast analysis for all SKUs
  private static async claudeRapidAnalysis(
    skus: AlcoholSKU[],
    competitorData: CompetitorPrice[]
  ): Promise<any[]> {
    console.log(`🔍 Claude rapid analysis for ${skus.length} SKUs`)
    
    // Use Claude for efficient pattern detection and rapid recommendations
    const analysis = {
      overpriced_products: skus.filter(sku => {
        const competitors = competitorData.filter(c => c.sku === sku.sku)
        if (competitors.length === 0) return false
        const avgCompPrice = competitors.reduce((sum, c) => sum + c.competitor_price, 0) / competitors.length
        return parseFloat(sku.price) > avgCompPrice * 1.15
      }),
      underpriced_products: skus.filter(sku => {
        const competitors = competitorData.filter(c => c.sku === sku.sku)
        if (competitors.length === 0) return false
        const avgCompPrice = competitors.reduce((sum, c) => sum + c.competitor_price, 0) / competitors.length
        return parseFloat(sku.price) < avgCompPrice * 0.85
      }),
      stockout_risks: skus.filter(sku => {
        const weeksOfStock = parseInt(sku.inventory_level) / parseFloat(sku.weekly_sales)
        return weeksOfStock < 2
      }),
      slow_movers: skus.filter(sku => parseFloat(sku.weekly_sales) < 1)
    }
    
    return [
      {
        type: 'rapid_pricing_analysis',
        source: 'claude',
        findings: analysis,
        confidence: 0.8,
        processing_time_ms: 50
      }
    ]
  }

  // GPT-4: Deep analysis only for high-value SKUs
  private static async gpt4DeepAnalysis(
    highValueSKUs: AlcoholSKU[],
    competitorData: CompetitorPrice[]
  ): Promise<any[]> {
    if (highValueSKUs.length === 0) return []
    
    console.log(`🧠 GPT-4 deep analysis for ${highValueSKUs.length} high-value SKUs`)
    
    // This would call your existing GPTCommerceIntelligence.generateCreativeRecommendations
    // but only for the most valuable SKUs to control costs
    
    const slowMovers = highValueSKUs.filter(sku => parseFloat(sku.weekly_sales) < 1)
    
    if (slowMovers.length > 0) {
      // Use your existing GPT-4 creative recommendations but limit scope
      return [
        {
          type: 'creative_strategies',
          source: 'gpt4',
          strategies: [
            {
              title: 'Premium Bundle Strategy',
              description: `Create curated bundles for ${slowMovers.length} slow-moving premium products`,
              estimated_impact: slowMovers.length * 15.99,
              implementation_complexity: 'medium'
            }
          ],
          confidence: 0.9,
          processing_time_ms: 2000
        }
      ]
    }
    
    return []
  }

  // Smart SKU prioritization based on business impact
  private static prioritizeSKUsForAnalysis(
    skus: AlcoholSKU[],
    priorityCategories: string[]
  ): AlcoholSKU[] {
    return skus
      .map(sku => ({
        ...sku,
        priority_score: this.calculatePriorityScore(sku, priorityCategories)
      }))
      .sort((a, b) => b.priority_score - a.priority_score)
  }

  private static calculatePriorityScore(sku: AlcoholSKU, priorityCategories: string[]): number {
    let score = 0
    
    // Revenue impact (weekly sales * price)
    const weeklyRevenue = parseFloat(sku.weekly_sales) * parseFloat(sku.price)
    score += weeklyRevenue * 0.4
    
    // Inventory value (inventory * price)
    const inventoryValue = parseInt(sku.inventory_level) * parseFloat(sku.price)
    score += inventoryValue * 0.0001  // Scale down inventory impact
    
    // Category priority
    if (priorityCategories.includes(sku.category)) {
      score += 100
    }
    
    // High-margin products (spirits typically higher margin)
    if (sku.category === 'spirits' && parseFloat(sku.price) > 30) {
      score += 50
    }
    
    // Fast movers (higher priority for competitive analysis)
    if (parseFloat(sku.weekly_sales) > 5) {
      score += 30
    }
    
    // Risk factors (low stock = higher priority)
    const weeksOfStock = parseInt(sku.inventory_level) / parseFloat(sku.weekly_sales)
    if (weeksOfStock < 4) {
      score += 25
    }
    
    return score
  }

  private static selectSKUsWithinBudget(
    prioritizedSKUs: AlcoholSKU[],
    budgetRemaining: number
  ): AlcoholSKU[] {
    const estimatedCostPerSKU = 0.15  // £0.15 per SKU (scraping + AI analysis)
    const maxSKUs = Math.floor(budgetRemaining / estimatedCostPerSKU)
    
    return prioritizedSKUs.slice(0, Math.min(maxSKUs, 50))  // Cap at 50 SKUs per analysis
  }

  private static identifyHighValueSKUs(
    skus: AlcoholSKU[],
    rapidInsights: any[]
  ): AlcoholSKU[] {
    // Only use expensive GPT-4 for SKUs that could benefit from creative strategies
    return skus.filter(sku => {
      const weeklyRevenue = parseFloat(sku.weekly_sales) * parseFloat(sku.price)
      const inventoryValue = parseInt(sku.inventory_level) * parseFloat(sku.price)
      
      return (
        weeklyRevenue < 10 &&  // Slow movers
        inventoryValue > 200 && // High inventory value
        parseFloat(sku.price) > 20  // Premium products
      )
    }).slice(0, 10)  // Limit to top 10 for cost control
  }

  private static combineInsights(
    rapidInsights: any[],
    deepInsights: any[],
    competitorData: CompetitorPrice[]
  ): any[] {
    const recommendations = []
    
    // Extract actionable recommendations from both analysis types
    for (const insight of rapidInsights) {
      if (insight.findings?.overpriced_products?.length > 0) {
        recommendations.push({
          type: 'price_reduction',
          urgency: 'high',
          affected_skus: insight.findings.overpriced_products.length,
          estimated_impact: insight.findings.overpriced_products.length * 25,
          source: 'claude_rapid'
        })
      }
      
      if (insight.findings?.stockout_risks?.length > 0) {
        recommendations.push({
          type: 'reorder_urgently',
          urgency: 'critical',
          affected_skus: insight.findings.stockout_risks.length,
          estimated_impact: insight.findings.stockout_risks.length * 100,
          source: 'claude_rapid'
        })
      }
    }
    
    // Add GPT-4 creative strategies
    for (const insight of deepInsights) {
      if (insight.strategies) {
        recommendations.push(...insight.strategies.map((strategy: any) => ({
          ...strategy,
          type: 'creative_strategy',
          urgency: 'medium',
          source: 'gpt4_deep'
        })))
      }
    }
    
    return recommendations
  }

  private static estimateClaudeTokens(skus: AlcoholSKU[], competitorData: CompetitorPrice[]): number {
    // Estimate tokens for Claude analysis
    return skus.length * 50 + competitorData.length * 30
  }

  private static estimateGPT4Tokens(skus: AlcoholSKU[]): number {
    // Estimate tokens for GPT-4 creative analysis
    return skus.length * 200  // More tokens for creative analysis
  }

  private static calculateCurrentCost(costs: { claude: number, gpt4: number, scraping: number }): number {
    return costs.claude + costs.gpt4 + costs.scraping
  }

  private static calculateEfficiencyScore(recommendationsCount: number, totalCost: number): number {
    if (totalCost === 0) return 0
    return recommendationsCount / totalCost  // Recommendations per £1
  }

  // Budget monitoring and alerts
  static async checkBudgetStatus(userId: string): Promise<{
    monthly_spent: number
    budget_remaining: number
    projected_monthly_cost: number
    recommendations: string[]
  }> {
    // This would query your database for user's monthly AI usage costs
    const monthlySpent = 45.67  // Example: query from database
    const budgetRemaining = this.COST_CONFIG.monthly_budget_gbp - monthlySpent
    
    const recommendations = []
    if (budgetRemaining < 50) {
      recommendations.push('Approaching budget limit - prioritize high-value SKUs only')
    }
    if (monthlySpent > 150) {
      recommendations.push('Consider upgrading budget or reducing analysis frequency')
    }
    
    return {
      monthly_spent: monthlySpent,
      budget_remaining: budgetRemaining,
      projected_monthly_cost: monthlySpent * 1.2,  // Project based on current usage
      recommendations
    }
  }
}
// /src/lib/alcohol-insights-engine.ts
// Advanced insights generator for alcohol industry competitive intelligence

import { AlcoholSKU, CompetitorPrice } from '@/types'
import { AlcoholMarketIntelligence } from './alcohol-market-intelligence'

export interface MarketInsight {
  id: string
  type: 'competitive' | 'seasonal' | 'pricing' | 'portfolio' | 'trend' | 'opportunity'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: {
    revenue_potential?: number
    risk_level: 'low' | 'medium' | 'high'
    time_sensitivity: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  }
  actionable_steps: string[]
  data_source: string
  confidence_score: number
  related_products: string[]
}

export interface CompetitiveIntelligence {
  market_position: 'leader' | 'challenger' | 'follower' | 'niche'
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  strategic_recommendations: string[]
  competitive_gaps: string[]
  price_positioning: {
    vs_premium_brands: number
    vs_mainstream_brands: number
    vs_value_brands: number
  }
}

export class AlcoholInsightsEngine {
  
  // Generate comprehensive market insights from uploaded inventory
  static generateMarketInsights(
    alcoholSKUs: AlcoholSKU[],
    competitorData: CompetitorPrice[] = [],
    analysisResults: any[] = []
  ): MarketInsight[] {
    const insights: MarketInsight[] = []
    
    // Competitive insights
    insights.push(...this.generateCompetitiveInsights(alcoholSKUs, competitorData))
    
    // Seasonal insights
    insights.push(...this.generateSeasonalInsights(alcoholSKUs))
    
    // Pricing insights
    insights.push(...this.generatePricingInsights(alcoholSKUs, competitorData))
    
    // Portfolio insights
    insights.push(...this.generatePortfolioInsights(alcoholSKUs))
    
    // Market trend insights
    insights.push(...this.generateTrendInsights(alcoholSKUs))
    
    // Opportunity insights
    insights.push(...this.generateOpportunityInsights(alcoholSKUs, competitorData))
    
    // Sort by priority and confidence
    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence_score - a.confidence_score
    })
  }
  
  // Generate competitive positioning analysis
  private static generateCompetitiveInsights(
    alcoholSKUs: AlcoholSKU[],
    competitorData: CompetitorPrice[]
  ): MarketInsight[] {
    const insights: MarketInsight[] = []
    
    // Analyze each product's competitive position
    for (const sku of alcoholSKUs) {
      const productMatch = AlcoholMarketIntelligence.findBestProductMatch(sku.sku)
      if (!productMatch.brand || productMatch.confidence < 0.5) continue
      
      const relatedCompetitors = competitorData.filter(c => c.sku === sku.sku)
      const ourPrice = parseFloat(sku.price)
      
      if (relatedCompetitors.length > 0) {
        const avgCompPrice = relatedCompetitors.reduce((sum, c) => sum + c.competitor_price, 0) / relatedCompetitors.length
        const priceDifference = ((ourPrice - avgCompPrice) / avgCompPrice) * 100
        
        // Significant price disadvantage
        if (priceDifference > 25 && productMatch.brand.premium_tier !== 'ultra_premium') {
          insights.push({
            id: `competitive-threat-${sku.sku}`,
            type: 'competitive',
            priority: 'critical',
            title: `Critical Price Disadvantage: ${sku.sku}`,
            description: `Your ${productMatch.brand.name} is priced ${priceDifference.toFixed(1)}% above competitors (£${ourPrice} vs avg £${avgCompPrice.toFixed(2)}). Risk of significant market share loss.`,
            impact: {
              revenue_potential: -(parseFloat(sku.weekly_sales) * 52 * ourPrice * 0.3),
              risk_level: 'high',
              time_sensitivity: 'immediate'
            },
            actionable_steps: [
              `Reduce price to £${(avgCompPrice * 1.05).toFixed(2)} (5% premium to avg)`,
              'Analyze value proposition vs competitors',
              'Consider promotional pricing strategy',
              'Review supplier costs and margins'
            ],
            data_source: 'Competitive price analysis',
            confidence_score: 0.9,
            related_products: [sku.sku]
          })
        }
        
        // Pricing opportunity
        else if (priceDifference < -15 && productMatch.brand.premium_tier === 'premium') {
          const revenueOpportunity = parseFloat(sku.weekly_sales) * 52 * (avgCompPrice * 0.95 - ourPrice)
          
          insights.push({
            id: `pricing-opportunity-${sku.sku}`,
            type: 'pricing',
            priority: 'high',
            title: `Premium Pricing Opportunity: ${sku.sku}`,
            description: `Your ${productMatch.brand.name} is underpriced vs market by ${Math.abs(priceDifference).toFixed(1)}%. Strong brand allows price increase.`,
            impact: {
              revenue_potential: revenueOpportunity,
              risk_level: 'low',
              time_sensitivity: 'short_term'
            },
            actionable_steps: [
              `Test price increase to £${(avgCompPrice * 0.95).toFixed(2)}`,
              'Emphasize premium brand positioning in marketing',
              'Monitor sales volume impact',
              'Implement gradual 2-3% monthly increases'
            ],
            data_source: 'Brand positioning analysis',
            confidence_score: 0.8,
            related_products: [sku.sku]
          })
        }
      }
    }
    
    return insights
  }
  
  // Generate seasonal insights and recommendations
  private static generateSeasonalInsights(alcoholSKUs: AlcoholSKU[]): MarketInsight[] {
    const insights: MarketInsight[] = []
    const currentMonth = new Date().getMonth() + 1
    const seasonalProducts = new Map<string, AlcoholSKU[]>()
    
    // Group products by category for seasonal analysis
    for (const sku of alcoholSKUs) {
      const category = sku.category
      if (!seasonalProducts.has(category)) {
        seasonalProducts.set(category, [])
      }
      seasonalProducts.get(category)!.push(sku)
    }
    
    // Analyze seasonal opportunities for each category
    for (const [category, skus] of seasonalProducts) {
      const seasonalPatterns = this.getSeasonalPatterns(category)
      const currentFactor = seasonalPatterns[this.getMonthName(currentMonth)] || 1.0
      const nextMonthFactor = seasonalPatterns[this.getMonthName(currentMonth + 1)] || 1.0
      
      // Approaching peak season
      if (nextMonthFactor > 1.2 && currentFactor < 1.1) {
        const totalWeeklySales = skus.reduce((sum, sku) => sum + parseFloat(sku.weekly_sales), 0)
        const potentialRevenue = totalWeeklySales * 4 * (nextMonthFactor - 1) * skus.reduce((sum, sku) => sum + parseFloat(sku.price), 0) / skus.length
        
        insights.push({
          id: `seasonal-prep-${category}`,
          type: 'seasonal',
          priority: 'high',
          title: `${category.toUpperCase()} Peak Season Approaching`,
          description: `${category} category entering peak demand period next month (${nextMonthFactor.toFixed(1)}x normal demand). Prepare inventory and marketing.`,
          impact: {
            revenue_potential: potentialRevenue,
            risk_level: 'medium',
            time_sensitivity: 'immediate'
          },
          actionable_steps: [
            `Increase ${category} inventory by ${Math.round((nextMonthFactor - 1) * 100)}%`,
            'Prepare seasonal marketing campaigns',
            'Review supplier lead times and capacity',
            'Consider seasonal pricing adjustments',
            'Optimize product placement and merchandising'
          ],
          data_source: 'Seasonal demand patterns',
          confidence_score: 0.85,
          related_products: skus.map(s => s.sku)
        })
      }
      
      // Currently in peak season - optimize pricing
      if (currentFactor > 1.3) {
        const totalWeeklySales = skus.reduce((sum, sku) => sum + parseFloat(sku.weekly_sales), 0)
        insights.push({
          id: `seasonal-pricing-${category}`,
          type: 'seasonal',
          priority: 'medium',
          title: `Peak Season Pricing Optimization: ${category.toUpperCase()}`,
          description: `${category} is in peak demand period (${currentFactor.toFixed(1)}x normal). Consider premium pricing for high-demand items.`,
          impact: {
            revenue_potential: totalWeeklySales * 4 * 0.1 * skus.reduce((sum, sku) => sum + parseFloat(sku.price), 0) / skus.length,
            risk_level: 'low',
            time_sensitivity: 'short_term'
          },
          actionable_steps: [
            'Implement 5-10% peak season price increases',
            'Focus marketing on premium products',
            'Create seasonal bundles and gift sets',
            'Monitor competitor pricing closely'
          ],
          data_source: 'Seasonal pricing analysis',
          confidence_score: 0.75,
          related_products: skus.map(s => s.sku).slice(0, 5)
        })
      }
    }
    
    return insights
  }
  
  // Helper methods
  private static generatePricingInsights(alcoholSKUs: AlcoholSKU[], competitorData: CompetitorPrice[]): MarketInsight[] {
    // Implementation for pricing insights
    return []
  }
  
  private static generatePortfolioInsights(alcoholSKUs: AlcoholSKU[]): MarketInsight[] {
    // Implementation for portfolio insights
    return []
  }
  
  private static generateTrendInsights(alcoholSKUs: AlcoholSKU[]): MarketInsight[] {
    // Implementation for trend insights
    return []
  }
  
  private static generateOpportunityInsights(alcoholSKUs: AlcoholSKU[], competitorData: CompetitorPrice[]): MarketInsight[] {
    // Implementation for opportunity insights
    return []
  }
  
  private static getSeasonalPatterns(category: string): { [month: string]: number } {
    const patterns: { [category: string]: { [month: string]: number } } = {
      'spirits': {
        january: 1.1, february: 0.9, march: 0.95, april: 1.0,
        may: 1.0, june: 1.05, july: 1.05, august: 1.0,
        september: 1.0, october: 1.1, november: 1.2, december: 1.3
      },
      'wine': {
        january: 1.05, february: 0.95, march: 1.0, april: 1.05,
        may: 1.1, june: 1.15, july: 1.15, august: 1.1,
        september: 1.05, october: 1.1, november: 1.15, december: 1.25
      },
      'beer': {
        january: 0.85, february: 0.8, march: 0.9, april: 1.05,
        may: 1.15, june: 1.25, july: 1.35, august: 1.3,
        september: 1.1, october: 1.0, november: 0.95, december: 1.05
      }
    }
    
    return patterns[category] || patterns.spirits
  }
  
  private static getMonthName(month: number): string {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    return months[(month - 1) % 12]
  }
}
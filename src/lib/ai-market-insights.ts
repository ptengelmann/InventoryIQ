// src/lib/ai-market-insights.ts
// Claude-powered market insights generation

import { AlcoholSKU } from '@/types'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface MarketInsight {
  id: string
  type: 'pricing' | 'competitive' | 'portfolio' | 'market_trend' | 'opportunity' | 'risk'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  actionable_steps: string[]
  estimated_impact?: number
  confidence_level?: number
  related_products?: string[]
  implementation_timeline?: string
  market_context?: string
}

export class AIMarketInsights {

  static async generateMarketInsights(
    alcoholSKUs: AlcoholSKU[],
    priceRecommendations: any[],
    competitorData: any[] = [],
    seasonalStrategies: any[] = []
  ): Promise<MarketInsight[]> {
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found - using fallback market insights')
      return this.generateFallbackInsights(alcoholSKUs, priceRecommendations, competitorData)
    }

    if (alcoholSKUs.length === 0) {
      console.log('⚠️ No SKU data for market insights')
      return []
    }

    try {
      console.log('🧠 Generating AI-powered market insights using Claude...')
      
      const prompt = this.buildMarketInsightsPrompt(
        alcoholSKUs, 
        priceRecommendations, 
        competitorData, 
        seasonalStrategies
      )
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20250114',
        max_tokens: 3000,
        temperature: 0.8, // Higher creativity for insights
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
      
      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      console.log('✅ Claude market insights response received, length:', responseText.length)
      
      // Parse JSON response
      let insightsData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('❌ No JSON found in Claude response - using fallback')
          return this.generateFallbackInsights(alcoholSKUs, priceRecommendations, competitorData)
        }
        
        insightsData = JSON.parse(jsonMatch[0])
        console.log('✅ Successfully parsed market insights JSON')
        
      } catch (parseError) {
        console.error('❌ Failed to parse market insights JSON:', parseError)
        return this.generateFallbackInsights(alcoholSKUs, priceRecommendations, competitorData)
      }
      
      const insights = insightsData.market_insights || insightsData.insights || []
      
      if (!Array.isArray(insights) || insights.length === 0) {
        console.error('❌ No valid insights array found - using fallback')
        return this.generateFallbackInsights(alcoholSKUs, priceRecommendations, competitorData)
      }
      
      console.log(`🧠 Generated ${insights.length} AI-powered market insights`)
      
      // Transform insights to match our interface
      const transformedInsights = insights.map((insight: any, index: number) => ({
        id: `claude-insight-${Date.now()}-${index}`,
        type: insight.type || 'market_trend',
        priority: insight.priority || 'medium',
        title: insight.title || `Market Insight ${index + 1}`,
        description: insight.description || '',
        actionable_steps: Array.isArray(insight.actionable_steps) ? insight.actionable_steps : [],
        estimated_impact: parseFloat(insight.estimated_impact) || 0,
        confidence_level: parseFloat(insight.confidence_level) || 0.7,
        related_products: Array.isArray(insight.related_products) ? insight.related_products : [],
        implementation_timeline: insight.implementation_timeline || '2-4 weeks',
        market_context: insight.market_context || ''
      }))

      // Sort by priority and impact
      const sortedInsights = transformedInsights.sort((a: MarketInsight, b: MarketInsight) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return (b.estimated_impact || 0) - (a.estimated_impact || 0)
      })
      
      console.log(`📊 Returning ${sortedInsights.length} Claude-generated market insights`)
      return sortedInsights.slice(0, 6) // Return top 6 insights
      
    } catch (error) {
      console.error('❌ Claude market insights generation failed:', error)
      return this.generateFallbackInsights(alcoholSKUs, priceRecommendations, competitorData)
    }
  }

  private static buildMarketInsightsPrompt(
    alcoholSKUs: AlcoholSKU[],
    priceRecommendations: any[],
    competitorData: any[],
    seasonalStrategies: any[]
  ): string {
    
    // Analyze the data for key insights
    const totalSKUs = alcoholSKUs.length
    const categories = [...new Set(alcoholSKUs.map(sku => sku.category))]
    const avgPrice = alcoholSKUs.reduce((sum, sku) => sum + parseFloat(sku.price), 0) / totalSKUs
    const slowMovers = alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) < 1).length
    const fastMovers = alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) > 5).length
    const premiumProducts = alcoholSKUs.filter(sku => parseFloat(sku.price) > 40).length
    
    const priceIncreases = priceRecommendations.filter(r => r.changePercentage > 0).length
    const priceDecreases = priceRecommendations.filter(r => r.changePercentage < 0).length
    
    return `You are a senior UK alcohol retail market analyst. Generate 4-5 strategic market insights based on this alcohol retailer's data.

PORTFOLIO OVERVIEW:
- Total Products: ${totalSKUs}
- Categories: ${categories.join(', ')}
- Average Price: £${avgPrice.toFixed(2)}
- Premium Products (>£40): ${premiumProducts}
- Fast Movers (>5 weekly sales): ${fastMovers}
- Slow Movers (<1 weekly sales): ${slowMovers}

PRICING ANALYSIS:
- Price Increase Recommendations: ${priceIncreases}
- Price Decrease Recommendations: ${priceDecreases}
- Total Revenue Potential: £${priceRecommendations.reduce((sum, r) => sum + (r.revenueImpact || 0), 0).toFixed(0)}

COMPETITIVE LANDSCAPE:
- Competitor Data Points: ${competitorData.length}
- Average Price Variance: ${competitorData.length > 0 ? (competitorData.reduce((sum, c) => sum + Math.abs(c.price_difference_percentage || 0), 0) / competitorData.length).toFixed(1) : 0}%

SEASONAL OPPORTUNITIES:
- Seasonal Strategies Generated: ${seasonalStrategies.length}
- Seasonal Revenue Potential: £${seasonalStrategies.reduce((sum, s) => sum + (s.estimated_revenue_impact || 0), 0)}

SAMPLE PRODUCTS (Top 10):
${alcoholSKUs.slice(0, 10).map(sku => 
  `- ${sku.sku}: ${sku.category}, £${sku.price}, ${sku.weekly_sales} weekly sales, ${sku.inventory_level} units`
).join('\n')}

Generate 4-5 strategic market insights that provide actionable intelligence for this UK alcohol retailer. Focus on:

1. Market positioning opportunities
2. Portfolio optimization insights  
3. Competitive advantages to leverage
4. Revenue growth strategies
5. Risk management recommendations

Each insight should be specific, actionable, and based on the actual data provided.

Return ONLY this JSON format:

{
  "market_insights": [
    {
      "type": "pricing",
      "priority": "high",
      "title": "Premium Positioning Opportunity",
      "description": "Analysis reveals ${premiumProducts} premium products with strong performance indicators, suggesting opportunity for strategic price positioning in the luxury segment",
      "actionable_steps": [
        "Implement tiered pricing strategy for premium spirits",
        "Develop luxury brand partnerships",
        "Create premium customer experience programs",
        "Launch targeted marketing to affluent demographics"
      ],
      "estimated_impact": 2500,
      "confidence_level": 0.85,
      "related_products": ["${alcoholSKUs[0]?.sku || 'EXAMPLE-001'}", "${alcoholSKUs[1]?.sku || 'EXAMPLE-002'}"],
      "implementation_timeline": "2-3 weeks",
      "market_context": "UK premium alcohol market growing 8% annually, driven by experience-seeking consumers"
    },
    {
      "type": "portfolio",
      "priority": "medium", 
      "title": "Inventory Velocity Optimization",
      "description": "Portfolio shows ${slowMovers} slow-moving products representing significant working capital opportunity",
      "actionable_steps": [
        "Implement dynamic pricing for slow movers",
        "Create bundling strategies to move stagnant inventory",
        "Reduce ordering for consistently poor performers",
        "Focus marketing spend on proven fast movers"
      ],
      "estimated_impact": 1800,
      "confidence_level": 0.92,
      "related_products": [],
      "implementation_timeline": "1-2 weeks",
      "market_context": "Efficient inventory turnover critical in alcohol retail with high carrying costs"
    }
  ]
}

Generate 4-5 unique insights covering different strategic areas. Make them specific to this retailer's data and UK market conditions.

CRITICAL: Return ONLY the JSON object, no additional text.`
  }

  // Fallback insights when Claude API fails
  private static generateFallbackInsights(
    alcoholSKUs: AlcoholSKU[],
    priceRecommendations: any[],
    competitorData: any[]
  ): MarketInsight[] {
    
    const insights: MarketInsight[] = []
    
    console.log('🔄 Generating fallback market insights')

    // Pricing opportunity insight
    const underPricedProducts = priceRecommendations.filter(r => r.changePercentage > 5)
    if (underPricedProducts.length > 0) {
      insights.push({
        id: `fallback-pricing-${Date.now()}`,
        type: 'pricing',
        priority: 'high',
        title: 'Pricing Optimization Opportunities',
        description: `${underPricedProducts.length} products identified with significant pricing potential. Strategic adjustments could increase monthly revenue by £${underPricedProducts.reduce((sum, p) => sum + (p.revenueImpact || 0), 0).toFixed(0)}.`,
        actionable_steps: [
          'Implement gradual price increases for underpriced products',
          'Monitor competitor pricing weekly',
          'Test price elasticity on high-margin items',
          'Focus on products with strong demand indicators'
        ],
        estimated_impact: underPricedProducts.reduce((sum, p) => sum + (p.revenueImpact || 0), 0),
        confidence_level: 0.8
      })
    }

    // Portfolio health insight  
    const slowMovers = alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) < 1)
    const fastMovers = alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) > 5)
    
    if (slowMovers.length > 0 || fastMovers.length > 0) {
      insights.push({
        id: `fallback-portfolio-${Date.now()}`,
        type: 'portfolio',
        priority: 'medium',
        title: 'Portfolio Performance Analysis',
        description: `Portfolio reveals ${fastMovers.length} high-velocity products and ${slowMovers.length} slow-moving items. Optimizing product mix could improve cash flow significantly.`,
        actionable_steps: [
          'Double down on marketing for fast-moving products',
          'Create clearance strategies for slow movers',
          'Adjust inventory levels based on velocity',
          'Consider discontinuing consistent poor performers'
        ],
        estimated_impact: 1200,
        confidence_level: 0.75
      })
    }

    // Competitive positioning insight
    if (competitorData.length > 0) {
      const avgPriceDiff = competitorData.reduce((sum, c) => sum + Math.abs(c.price_difference_percentage || 0), 0) / competitorData.length
      insights.push({
        id: `fallback-competitive-${Date.now()}`,
        type: 'competitive', 
        priority: 'medium',
        title: 'UK Market Competitive Position',
        description: `Competitive analysis across ${competitorData.length} products shows average ${avgPriceDiff.toFixed(1)}% price variance, indicating market positioning opportunities.`,
        actionable_steps: [
          'Review products with >15% price differences',
          'Develop channel-specific pricing strategies', 
          'Monitor competitor promotional activities',
          'Consider premium positioning for quality products'
        ],
        estimated_impact: 800,
        confidence_level: 0.7
      })
    }

    return insights.slice(0, 4) // Return top 4 fallback insights
  }
}
// src/app/api/competitors/pricing/route.ts
// CORRECTED VERSION - Fixed all TypeScript errors

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface PriceComparisonResult {
  sku: string
  our_price: number
  competitor_prices: any[]
  market_position: {
    rank: number
    percentile: number
    price_advantage: number
  }
  recommendations: {
    action: 'maintain' | 'increase' | 'decrease' | 'investigate'
    target_price?: number
    reasoning: string
    urgency: 'low' | 'medium' | 'high'
    revenue_impact?: number
  }
  inventory_context?: {
    weekly_sales: number
    inventory_level: number
    weeks_of_stock: number
    category: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const days = parseInt(searchParams.get('days') || '7')
    const includeAI = searchParams.get('includeAI') !== 'false'
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        error: 'User authentication required'
      }, { status: 401 })
    }
    
    const userIdentifier = userId || userEmail || ''
    console.log(`🎯 Getting ENHANCED competitive pricing for user: ${userIdentifier}`)
    
    try {
      // Step 1: Get user's inventory for context
      const userSKUs = await PostgreSQLService.getUserSKUs(userIdentifier)
      console.log(`📦 Found ${userSKUs.length} SKUs in user inventory`)
      
      // Step 2: Get competitor data from database
      const competitorData = await PostgreSQLService.getCompetitorData(userIdentifier, days)
      console.log(`🎯 Found ${competitorData.length} competitor price records`)
      
      // Step 3: Enhanced transformation with inventory context
      const comparisons = transformToEnhancedComparisonResults(competitorData, userSKUs)
      
      // Step 4: Generate AI strategic insights (if enabled)
      let strategicInsights: string | null = null
      if (includeAI && comparisons.length > 0 && process.env.ANTHROPIC_API_KEY) {
        try {
          strategicInsights = await generateAIStrategicInsights(comparisons, userIdentifier)
        } catch (aiError) {
          console.error('AI insights failed:', aiError)
        }
      }
      
      // Step 5: Calculate enhanced summary stats
      const summaryStats = calculateEnhancedSummaryStats(comparisons, userSKUs)
      
      return NextResponse.json({
        success: true,
        comparisons,
        summary: summaryStats,
        strategic_insights: strategicInsights,
        
        // Enhanced metadata
        inventory_integration: {
          total_inventory_skus: userSKUs.length,
          skus_with_competitive_data: comparisons.length,
          coverage_percentage: userSKUs.length > 0 ? Math.round((comparisons.length / userSKUs.length) * 100) : 0,
          high_value_coverage: calculateHighValueCoverage(comparisons, userSKUs),
        },
        
        market_intelligence: {
          total_competitor_prices: competitorData.length,
          unique_competitors: [...new Set(competitorData.map(c => c.competitor))].length,
          days_analyzed: days,
          data_freshness: calculateDataFreshness(competitorData),
        },
        
        actionable_insights: {
          urgent_actions: comparisons.filter(c => c.recommendations.urgency === 'high').length,
          revenue_opportunities: comparisons.filter(c => (c.recommendations.revenue_impact || 0) > 100).length,
          overpriced_products: comparisons.filter(c => c.market_position.price_advantage > 15).length,
          underpriced_opportunities: comparisons.filter(c => c.market_position.price_advantage < -10).length,
        },
        
        timestamp: new Date().toISOString()
      })
      
    } catch (dataError) {
      console.error('Data processing failed:', dataError)
      
      // Fallback: Return basic structure with guidance
      return NextResponse.json({
        success: true,
        comparisons: [],
        summary: {
          total_comparisons: 0,
          total_revenue_potential: 0,
          urgent_actions_needed: 0,
          competitive_coverage: 0
        },
        message: 'No competitive data available yet',
        guidance: {
          step1: 'Upload your inventory CSV via Analytics page',
          step2: 'Use Competitive dashboard to search for your products',
          step3: 'System will automatically match and compare prices',
          note: 'Competitive intelligence requires both inventory data and competitor price searches'
        },
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('❌ Enhanced competitor pricing API error:', error)
    return NextResponse.json({
      error: 'Failed to generate competitive pricing intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function transformToEnhancedComparisonResults(
  competitorData: any[], 
  userSKUs: any[]
): PriceComparisonResult[] {
  
  // Create SKU lookup for quick access
  const skuLookup = userSKUs.reduce((acc: Record<string, any>, sku: any) => {
    acc[sku.sku_code] = sku
    return acc
  }, {})
  
  // Group competitor prices by SKU
  const groupedBySKU = competitorData.reduce((acc: Record<string, any>, comp: any) => {
    if (!acc[comp.sku]) {
      acc[comp.sku] = {
        sku: comp.sku,
        our_price: comp.our_price || 0,
        competitors: []
      }
    }
    acc[comp.sku].competitors.push(comp)
    return acc
  }, {})
  
  // Transform to enhanced comparison results
  return Object.values(groupedBySKU).map((skuData: any) => {
    const competitors = skuData.competitors
    const ourPrice = skuData.our_price || 0
    const inventoryItem = skuLookup[skuData.sku]
    
    // Calculate market position
    const competitorPrices = competitors.map((c: any) => c.competitor_price)
    const allPrices = ourPrice > 0 ? [ourPrice, ...competitorPrices] : competitorPrices
    allPrices.sort((a: number, b: number) => a - b)
    
    const ourRank = ourPrice > 0 ? allPrices.indexOf(ourPrice) + 1 : 0
    const percentile = allPrices.length > 1 && ourPrice > 0 ? 
      ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100 : 50
    
    const avgCompPrice = competitorPrices.reduce((sum: number, p: number) => sum + p, 0) / competitorPrices.length
    const priceAdvantage = ourPrice > 0 ? ((ourPrice - avgCompPrice) / avgCompPrice) * 100 : 0
    
    // Generate enhanced recommendations with inventory context
    const recommendations = generateEnhancedRecommendations(
      ourPrice, 
      avgCompPrice, 
      priceAdvantage, 
      inventoryItem,
      competitors
    )
    
    const result: PriceComparisonResult = {
      sku: skuData.sku,
      our_price: ourPrice,
      competitor_prices: competitors,
      market_position: {
        rank: ourRank,
        percentile: Math.round(percentile),
        price_advantage: Math.round(priceAdvantage * 100) / 100
      },
      recommendations
    }
    
    // Add inventory context if available
    if (inventoryItem) {
      const weeksOfStock = inventoryItem.weekly_sales > 0 ? 
        inventoryItem.inventory_level / inventoryItem.weekly_sales : 999
      
      result.inventory_context = {
        weekly_sales: inventoryItem.weekly_sales || 0,
        inventory_level: inventoryItem.inventory_level || 0,
        weeks_of_stock: Math.round(weeksOfStock * 10) / 10,
        category: inventoryItem.category || 'unknown'
      }
      
      // Enhance recommendations with inventory context
      if (weeksOfStock > 12 && result.recommendations.action === 'maintain') {
        result.recommendations.action = 'decrease'
        result.recommendations.reasoning += ' + High inventory levels suggest promotional pricing opportunity'
        result.recommendations.urgency = 'medium'
      } else if (weeksOfStock < 3 && result.recommendations.action === 'decrease') {
        result.recommendations.action = 'maintain'
        result.recommendations.reasoning = 'Low inventory - maintain price despite competitive pressure'
        result.recommendations.urgency = 'low'
      }
    }
    
    return result
  })
}

function generateEnhancedRecommendations(
  ourPrice: number, 
  avgCompPrice: number, 
  priceAdvantage: number, 
  inventoryItem: any,
  competitors: any[]
): PriceComparisonResult['recommendations'] {
  
  let action: 'maintain' | 'increase' | 'decrease' | 'investigate' = 'maintain'
  let targetPrice: number | undefined
  let reasoning = 'Competitively positioned'
  let urgency: 'low' | 'medium' | 'high' = 'low'
  let revenueImpact = 0
  
  if (ourPrice === 0) {
    return {
      action: 'investigate',
      reasoning: 'No pricing data available for your inventory - update inventory prices',
      urgency: 'medium'
    }
  }
  
  // Price advantage analysis
  if (priceAdvantage > 20) {
    action = 'decrease'
    targetPrice = avgCompPrice * 1.05 // 5% above market average
    reasoning = `${priceAdvantage.toFixed(1)}% above market average - significant risk of lost sales`
    urgency = 'high'
  } else if (priceAdvantage > 10) {
    action = 'decrease'
    targetPrice = avgCompPrice * 1.03 // 3% above market average
    reasoning = `${priceAdvantage.toFixed(1)}% above market average - consider price reduction`
    urgency = 'medium'
  } else if (priceAdvantage < -15) {
    action = 'increase'
    targetPrice = avgCompPrice * 0.95 // 5% below market average
    reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - significant pricing opportunity`
    urgency = 'medium'
  } else if (priceAdvantage < -8) {
    action = 'increase'
    targetPrice = avgCompPrice * 0.98 // 2% below market average
    reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - gradual increase recommended`
    urgency = 'low'
  }
  
  // Calculate revenue impact if inventory data available
  if (inventoryItem && inventoryItem.weekly_sales > 0 && targetPrice) {
    const priceChange = targetPrice - ourPrice
    revenueImpact = priceChange * inventoryItem.weekly_sales * 4.33 // Monthly impact
  }
  
  // Competitive intensity analysis
  const promotionalCompetitors = competitors.filter((c: any) => c.promotional).length
  if (promotionalCompetitors > competitors.length * 0.5) {
    urgency = urgency === 'low' ? 'medium' : 'high'
    reasoning += ` | ${promotionalCompetitors} competitors running promotions`
  }
  
  return {
    action,
    target_price: targetPrice,
    reasoning,
    urgency,
    revenue_impact: Math.round(revenueImpact)
  }
}

function calculateEnhancedSummaryStats(comparisons: PriceComparisonResult[], userSKUs: any[]) {
  const totalRevenuePotential = comparisons.reduce((sum, comp) => {
    return sum + Math.abs(comp.recommendations.revenue_impact || 0)
  }, 0)
  
  const urgentActions = comparisons.filter(c => c.recommendations.urgency === 'high').length
  const competitiveCoverage = userSKUs.length > 0 ? (comparisons.length / userSKUs.length) * 100 : 0
  
  return {
    total_comparisons: comparisons.length,
    total_inventory_skus: userSKUs.length,
    competitive_coverage: Math.round(competitiveCoverage),
    
    market_positioning: {
      overpriced_skus: comparisons.filter(c => c.market_position.price_advantage > 10).length,
      underpriced_skus: comparisons.filter(c => c.market_position.price_advantage < -10).length,
      competitively_priced: comparisons.filter(c => 
        Math.abs(c.market_position.price_advantage) <= 10).length,
    },
    
    revenue_opportunities: {
      total_potential: Math.round(totalRevenuePotential),
      urgent_actions_needed: urgentActions,
      price_increase_opportunities: comparisons.filter(c => 
        c.recommendations.action === 'increase').length,
      defensive_pricing_needed: comparisons.filter(c => 
        c.recommendations.action === 'decrease').length,
    },
    
    inventory_health: {
      high_inventory_products: comparisons.filter(c => 
        (c.inventory_context?.weeks_of_stock || 0) > 10).length,
      low_inventory_products: comparisons.filter(c => 
        (c.inventory_context?.weeks_of_stock || 0) < 3).length,
      fast_movers: comparisons.filter(c => 
        (c.inventory_context?.weekly_sales || 0) > 5).length,
    }
  }
}

function calculateHighValueCoverage(comparisons: PriceComparisonResult[], userSKUs: any[]): number {
  const highValueSKUs = userSKUs.filter((sku: any) => (sku.price || 0) > 50) // Products over £50
  if (highValueSKUs.length === 0) return 0
  
  const highValueWithCompData = comparisons.filter(comp => 
    highValueSKUs.some((sku: any) => sku.sku_code === comp.sku)
  ).length
  
  return Math.round((highValueWithCompData / highValueSKUs.length) * 100)
}

function calculateDataFreshness(competitorData: any[]): string {
  if (competitorData.length === 0) return 'no_data'
  
  const now = new Date()
  const recentData = competitorData.filter((comp: any) => {
    const dataAge = now.getTime() - new Date(comp.last_updated).getTime()
    return dataAge < 24 * 60 * 60 * 1000 // Within 24 hours
  }).length
  
  const freshnessPercentage = (recentData / competitorData.length) * 100
  
  if (freshnessPercentage > 80) return 'very_fresh'
  if (freshnessPercentage > 50) return 'fresh'
  if (freshnessPercentage > 20) return 'moderate'
  return 'stale'
}

async function generateAIStrategicInsights(
  comparisons: PriceComparisonResult[], 
  userId: string
): Promise<string> {
  
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'AI strategic insights require ANTHROPIC_API_KEY configuration'
  }
  
  const urgentActions = comparisons.filter(c => c.recommendations.urgency === 'high')
  const revenueOpportunities = comparisons.filter(c => (c.recommendations.revenue_impact || 0) > 500)
  const overpriced = comparisons.filter(c => c.market_position.price_advantage > 15)
  const underpriced = comparisons.filter(c => c.market_position.price_advantage < -15)
  
  const prompt = `You are a strategic pricing consultant analyzing competitive intelligence for an alcohol retailer.

COMPETITIVE ANALYSIS SUMMARY:
- Total products analyzed: ${comparisons.length}
- Urgent pricing actions needed: ${urgentActions.length}
- Significant revenue opportunities: ${revenueOpportunities.length}
- Overpriced products (>15% above market): ${overpriced.length}
- Underpriced products (>15% below market): ${underpriced.length}

TOP CONCERNS:
${urgentActions.slice(0, 3).map(c => 
  `• ${c.sku}: ${c.recommendations.reasoning} (£${Math.abs(c.recommendations.revenue_impact || 0)} monthly impact)`
).join('\n')}

TOP OPPORTUNITIES:
${revenueOpportunities.slice(0, 3).map(c => 
  `• ${c.sku}: ${c.recommendations.reasoning} (£${c.recommendations.revenue_impact || 0} monthly potential)`
).join('\n')}

Provide 3-4 sentences of strategic insights focusing on:
1. Immediate priority actions
2. Market positioning strategy 
3. Revenue optimization approach

Keep it concise and actionable for alcohol retail management.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    const insight = response.content[0].type === 'text' ? response.content[0].text : ''
    return insight || 'Strategic insights generation failed'
    
  } catch (error) {
    console.error('AI insights generation failed:', error)
    return 'AI strategic insights temporarily unavailable'
  }
}
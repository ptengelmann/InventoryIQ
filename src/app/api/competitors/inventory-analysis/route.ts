// src/app/api/competitors/inventory-analysis/route.ts
// NEW ENDPOINT: Automatic competitive analysis for entire inventory

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { userEmail, maxProducts = 10, forceRefresh = false } = body
    
    if (!userEmail) {
      return NextResponse.json({
        error: 'User email required'
      }, { status: 400 })
    }
    
    console.log(`🎯 Starting FULL INVENTORY competitive analysis for ${userEmail}`)
    
    // Step 1: Get user's inventory
    const userSKUs = await PostgreSQLService.getUserSKUs(userEmail)
    console.log(`📦 Found ${userSKUs.length} SKUs in inventory`)
    
    if (userSKUs.length === 0) {
      return NextResponse.json({
        error: 'No inventory found',
        message: 'Upload inventory CSV first to enable competitive analysis',
        action: 'Upload inventory via Analytics page'
      }, { status: 400 })
    }
    
    // Step 2: Select priority products for competitive analysis
    const priorityProducts = selectPriorityProducts(userSKUs, maxProducts)
    console.log(`🎯 Selected ${priorityProducts.length} priority products for analysis`)
    
    // Step 3: Run competitive analysis for each priority product
    const competitiveResults: any[] = []
    let processedCount = 0
    let scrapingErrors = 0
    
    for (const sku of priorityProducts) {
      try {
        console.log(`🔍 [${processedCount + 1}/${priorityProducts.length}] Analyzing: ${sku.product_name || sku.sku_code}`)
        
        // Create search term from SKU data
        const searchTerm = createOptimalSearchTerm(sku)
        
        // Get real competitor prices
        const competitorPrices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
          searchTerm,
          sku.category,
          5, // Max 5 retailers per product
          false // Skip AI insights to save costs
        )
        
        if (competitorPrices.length > 0) {
          // Set our price and calculate differences
          competitorPrices.forEach(comp => {
            comp.our_price = sku.price
            comp.price_difference = comp.competitor_price - sku.price
            comp.price_difference_percentage = ((comp.competitor_price - sku.price) / sku.price) * 100
            comp.sku = sku.sku_code // Use our SKU code
          })
          
          competitiveResults.push({
            sku: sku.sku_code,
            product_name: sku.product_name,
            our_price: sku.price,
            weekly_sales: sku.weekly_sales || 0,
            inventory_level: sku.inventory_level || 0,
            competitor_count: competitorPrices.length,
            competitor_prices: competitorPrices,
            market_position: calculateMarketPosition(sku.price, competitorPrices),
            strategic_recommendation: generateProductRecommendation(sku, competitorPrices)
          })
          
          console.log(`✅ Found ${competitorPrices.length} competitor prices for ${sku.sku_code}`)
        } else {
          console.log(`⚠️ No competitor data found for ${sku.sku_code}`)
        }
        
        processedCount++
        
        // Rate limiting - be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (skuError) {
        console.error(`❌ Analysis failed for ${sku.sku_code}:`, skuError)
        scrapingErrors++
        continue
      }
    }
    
    // Step 4: Save competitor data to database
    const allCompetitorPrices = competitiveResults.flatMap(result => result.competitor_prices)
    if (allCompetitorPrices.length > 0) {
      try {
        await PostgreSQLService.saveCompetitorPrices(userEmail, allCompetitorPrices)
        console.log(`💾 Saved ${allCompetitorPrices.length} competitor prices to database`)
      } catch (saveError) {
        console.error('❌ Failed to save competitor data:', saveError)
      }
    }
    
    // Step 5: Generate executive summary with AI
    let executiveSummary = ''
    if (competitiveResults.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        executiveSummary = await generateExecutiveSummary(competitiveResults, userEmail)
      } catch (aiError) {
        console.error('AI summary failed:', aiError)
        executiveSummary = generateFallbackSummary(competitiveResults)
      }
    }
    
    // Step 6: Calculate comprehensive stats
    const analysisStats = calculateComprehensiveStats(competitiveResults, userSKUs)
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      analysis_id: `inventory-competitive-${Date.now()}`,
      
      // Results summary
      inventory_analysis: {
        total_inventory_skus: userSKUs.length,
        products_analyzed: priorityProducts.length,
        competitive_matches_found: competitiveResults.length,
        coverage_percentage: Math.round((competitiveResults.length / priorityProducts.length) * 100),
        total_competitor_prices: allCompetitorPrices.length,
        unique_competitors: [...new Set(allCompetitorPrices.map(c => c.competitor))].length
      },
      
      // Detailed results
      competitive_results: competitiveResults,
      
      // Strategic insights
      executive_summary: executiveSummary,
      
      // Comprehensive statistics
      market_intelligence: analysisStats,
      
      // Operational metadata
      processing: {
        time_taken_ms: processingTime,
        products_processed: processedCount,
        scraping_errors: scrapingErrors,
        api_calls_made: processedCount,
        estimated_cost: `$${(processedCount * 0.01).toFixed(2)}`, // Rough SERP API cost estimate
      },
      
      // Next steps guidance
      recommendations: {
        immediate_actions: competitiveResults
          .filter(r => r.strategic_recommendation?.urgency === 'high')
          .slice(0, 5)
          .map(r => ({
            sku: r.sku,
            action: r.strategic_recommendation.action,
            reasoning: r.strategic_recommendation.reasoning,
            potential_impact: r.strategic_recommendation.revenue_impact
          })),
        
        setup_monitoring: competitiveResults.length > 0 ? 
          'Set up automated price monitoring for these products' : null,
          
        expand_analysis: priorityProducts.length < userSKUs.length ? 
          `${userSKUs.length - priorityProducts.length} more products can be analyzed` : null
      },
      
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Inventory competitive analysis failed:', error)
    return NextResponse.json({
      error: 'Inventory competitive analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * Select priority products for competitive analysis
 */
function selectPriorityProducts(userSKUs: any[], maxProducts: number): any[] {
  return userSKUs
    // Filter for products likely to have online competition
    .filter(sku => sku.price > 15) // Only products over £15
    .filter(sku => sku.brand && sku.brand !== 'Unknown') // Must have brand
    // Sort by strategic importance
    .sort((a, b) => {
      // Priority scoring: price * weekly_sales (revenue impact)
      const scoreA = (a.price || 0) * (a.weekly_sales || 0)
      const scoreB = (b.price || 0) * (b.weekly_sales || 0)
      return scoreB - scoreA
    })
    .slice(0, maxProducts)
}

/**
 * Create optimal search term from SKU data
 */
function createOptimalSearchTerm(sku: any): string {
  const parts = []
  
  // Add brand if available and not generic
  if (sku.brand && sku.brand !== 'Unknown' && sku.brand.length > 2) {
    parts.push(sku.brand)
  }
  
  // Add subcategory or category
  if (sku.subcategory && sku.subcategory.length > 3) {
    parts.push(sku.subcategory)
  } else if (sku.category) {
    parts.push(sku.category)
  }
  
  // Add volume if available for spirits/wine
  if ((sku.category === 'spirits' || sku.category === 'wine') && sku.volume_ml) {
    if (sku.volume_ml === 750) parts.push('750ml')
    else if (sku.volume_ml === 1000) parts.push('1L')
    else if (sku.volume_ml === 500) parts.push('500ml')
  }
  
  // Fallback to product name or SKU
  if (parts.length === 0) {
    if (sku.product_name) parts.push(sku.product_name)
    else parts.push(sku.sku_code)
  }
  
  return parts.join(' ').trim()
}

/**
 * Calculate market position for a product
 */
function calculateMarketPosition(ourPrice: number, competitorPrices: any[]) {
  if (competitorPrices.length === 0) {
    return { rank: 1, percentile: 50, price_advantage: 0 }
  }
  
  const allPrices = [ourPrice, ...competitorPrices.map(c => c.competitor_price)].sort((a, b) => a - b)
  const ourRank = allPrices.indexOf(ourPrice) + 1
  const percentile = ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100
  
  const avgCompetitorPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
  const priceAdvantage = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100
  
  return {
    rank: ourRank,
    percentile: Math.round(percentile),
    price_advantage: Math.round(priceAdvantage * 100) / 100
  }
}

/**
 * Generate strategic recommendation for a product
 */
function generateProductRecommendation(sku: any, competitorPrices: any[]) {
  if (competitorPrices.length === 0) {
    return {
      action: 'investigate',
      reasoning: 'No competitive data found - unique product or search term needs refinement',
      urgency: 'low'
    }
  }
  
  const avgPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
  const priceAdvantage = ((sku.price - avgPrice) / avgPrice) * 100
  
  let action: 'maintain' | 'increase' | 'decrease' | 'investigate' = 'maintain'
  let reasoning = 'Competitively positioned'
  let urgency: 'low' | 'medium' | 'high' = 'low'
  let targetPrice: number | undefined
  let revenueImpact = 0
  
  if (priceAdvantage > 20) {
    action = 'decrease'
    targetPrice = avgPrice * 1.05
    reasoning = `${priceAdvantage.toFixed(1)}% above market - high risk of lost sales`
    urgency = 'high'
  } else if (priceAdvantage > 10) {
    action = 'decrease'
    targetPrice = avgPrice * 1.03
    reasoning = `${priceAdvantage.toFixed(1)}% above market - consider price reduction`
    urgency = 'medium'
  } else if (priceAdvantage < -15) {
    action = 'increase'
    targetPrice = avgPrice * 0.95
    reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - significant pricing opportunity`
    urgency = 'medium'
  } else if (priceAdvantage < -8) {
    action = 'increase'
    targetPrice = avgPrice * 0.98
    reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - gradual increase possible`
    urgency = 'low'
  }
  
  // Calculate revenue impact
  if (sku.weekly_sales > 0 && targetPrice) {
    revenueImpact = (targetPrice - sku.price) * sku.weekly_sales * 4.33 // Monthly impact
  }
  
  return {
    action,
    target_price: targetPrice,
    reasoning,
    urgency,
    revenue_impact: Math.round(revenueImpact)
  }
}

/**
 * Calculate comprehensive analysis statistics
 */
function calculateComprehensiveStats(competitiveResults: any[], userSKUs: any[]) {
  const totalRevenuePotential = competitiveResults.reduce((sum, result) => {
    return sum + Math.abs(result.strategic_recommendation?.revenue_impact || 0)
  }, 0)
  
  const overpriced = competitiveResults.filter(r => r.market_position.price_advantage > 10)
  const underpriced = competitiveResults.filter(r => r.market_position.price_advantage < -10)
  const urgentActions = competitiveResults.filter(r => r.strategic_recommendation?.urgency === 'high')
  
  return {
    portfolio_health: {
      total_revenue_potential: Math.round(totalRevenuePotential),
      overpriced_products: overpriced.length,
      underpriced_products: underpriced.length,
      urgent_actions_needed: urgentActions.length,
      competitive_coverage: Math.round((competitiveResults.length / userSKUs.length) * 100)
    },
    
    market_positioning: {
      price_leaders: competitiveResults.filter(r => r.market_position.rank === 1).length,
      price_followers: competitiveResults.filter(r => r.market_position.rank > 3).length,
      market_average_position: competitiveResults.length > 0 ? 
        Math.round(competitiveResults.reduce((sum, r) => sum + r.market_position.percentile, 0) / competitiveResults.length) : 50
    },
    
    strategic_opportunities: {
      immediate_revenue_gains: competitiveResults
        .filter(r => (r.strategic_recommendation?.revenue_impact || 0) > 100)
        .slice(0, 5)
        .map(r => ({
          sku: r.sku,
          monthly_impact: r.strategic_recommendation.revenue_impact,
          action: r.strategic_recommendation.action
        })),
      
      defensive_actions: urgentActions.slice(0, 3).map(r => ({
        sku: r.sku,
        issue: r.strategic_recommendation.reasoning,
        urgency: r.strategic_recommendation.urgency
      }))
    }
  }
}

/**
 * Generate AI executive summary
 */
async function generateExecutiveSummary(competitiveResults: any[], userEmail: string): Promise<string> {
  const totalProducts = competitiveResults.length
  const urgentActions = competitiveResults.filter(r => r.strategic_recommendation?.urgency === 'high').length
  const overpriced = competitiveResults.filter(r => r.market_position.price_advantage > 15).length
  const underpriced = competitiveResults.filter(r => r.market_position.price_advantage < -15).length
  
  const totalRevenue = competitiveResults.reduce((sum, r) => 
    sum + Math.abs(r.strategic_recommendation?.revenue_impact || 0), 0)
  
  const prompt = `Generate an executive summary for competitive pricing analysis of an alcohol retailer.

ANALYSIS RESULTS:
- Products analyzed: ${totalProducts}
- Urgent pricing actions needed: ${urgentActions}
- Overpriced products (>15% above market): ${overpriced}
- Underpriced opportunities (>15% below market): ${underpriced}
- Total monthly revenue potential: £${Math.round(totalRevenue)}

TOP ISSUES:
${competitiveResults
  .filter(r => r.strategic_recommendation?.urgency === 'high')
  .slice(0, 3)
  .map(r => `• ${r.sku}: ${r.strategic_recommendation.reasoning}`)
  .join('\n')}

TOP OPPORTUNITIES:
${competitiveResults
  .filter(r => (r.strategic_recommendation?.revenue_impact || 0) > 200)
  .slice(0, 3)
  .map(r => `• ${r.sku}: £${r.strategic_recommendation.revenue_impact} monthly potential`)
  .join('\n')}

Write a concise 4-5 sentence executive summary focusing on key insights and recommended actions for alcohol retail management. Include specific numbers and be direct about priorities.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 400,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  })
  
  return response.content[0].type === 'text' ? response.content[0].text : 'Executive summary generation failed'
}

/**
 * Fallback summary when AI is unavailable
 */
function generateFallbackSummary(competitiveResults: any[]): string {
  const urgentActions = competitiveResults.filter(r => r.strategic_recommendation?.urgency === 'high').length
  const totalRevenue = Math.round(competitiveResults.reduce((sum, r) => 
    sum + Math.abs(r.strategic_recommendation?.revenue_impact || 0), 0))
  
  return `Competitive analysis of ${competitiveResults.length} products identified ${urgentActions} urgent pricing actions and £${totalRevenue} monthly revenue optimization potential. Focus on immediate price adjustments for overpriced products to prevent sales loss, while gradually increasing prices on underpriced premium items to maximize margins.`
}
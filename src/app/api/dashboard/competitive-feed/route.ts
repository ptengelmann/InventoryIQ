// src/app/api/dashboard/competitive-feed/route.ts
// Claude AI-powered competitive intelligence dashboard

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ClaudeInsight {
  id: string
  type: 'strategic_alert' | 'market_opportunity' | 'competitive_threat' | 'pricing_strategy'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  claude_analysis: string
  strategic_recommendations: string[]
  immediate_actions: string[]
  revenue_impact_estimate: number
  confidence_score: number
  affected_products: string[]
  competitors_involved: string[]
  market_context: string
  urgency_timeline: string
  timestamp: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: 'Claude AI not configured',
        message: 'ANTHROPIC_API_KEY required for competitive intelligence'
      }, { status: 500 })
    }

    console.log(`🧠 Generating Claude AI competitive intelligence for ${userId}`)

    // Step 1: Get comprehensive competitive data
    const [competitorData, userSKUs, recentAnalyses] = await Promise.all([
      PostgreSQLService.getCompetitorData(userId, 7), // Last 7 days
      PostgreSQLService.getUserSKUs(userId),
      PostgreSQLService.getRecentAnalyses(userId, 3)
    ])

    if (userSKUs.length === 0) {
      return NextResponse.json({
        error: 'No inventory found',
        message: 'Upload your inventory to enable competitive intelligence',
        claude_insights: []
      }, { status: 400 })
    }

    console.log(`📊 Found ${competitorData.length} competitor prices for ${userSKUs.length} total SKUs`)

    // Step 2: AUTO-POPULATE competitive data if insufficient
    let enhancedCompetitorData = competitorData
    
    if (competitorData.length < 5 && userSKUs.length > 0) {
      console.log(`🔄 Insufficient competitive data (${competitorData.length} prices). Auto-populating...`)
      
      try {
        // Select top products for competitive analysis
        const priorityProducts = userSKUs
          .filter(sku => sku.price > 15 && sku.brand && sku.brand !== 'Unknown') // Filter suitable products
          .sort((a, b) => (b.price * (b.weekly_sales || 0)) - (a.price * (a.weekly_sales || 0))) // Sort by revenue
          .slice(0, 12) // Top 12 products
        
        console.log(`🎯 Auto-analyzing ${priorityProducts.length} priority products for competitive data`)
        
        // Batch competitive analysis
        const newCompetitorPrices: any[] = []
        let analysisCount = 0
        
        for (const sku of priorityProducts) {
          try {
            // Create search term
            const searchTerm = `${sku.brand || ''} ${sku.subcategory || sku.category}`.trim()
            
            console.log(`[${analysisCount + 1}/${priorityProducts.length}] Analyzing: ${searchTerm}`)
            
            // Get competitive prices
            const prices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
              searchTerm,
              sku.category,
              3, // Max 3 competitors per product
              false // Skip AI insights to save time/cost
            )
            
            if (prices.length > 0) {
              // Set our price and save
              const competitorPricesWithContext = prices.map(price => ({
                ...price,
                sku: sku.sku_code,
                our_price: sku.price,
                price_difference: price.competitor_price - sku.price,
                price_difference_percentage: ((price.competitor_price - sku.price) / sku.price) * 100
              }))
              
              // Save to database
              await PostgreSQLService.saveCompetitorPrices(userId, competitorPricesWithContext)
              
              newCompetitorPrices.push(...competitorPricesWithContext)
              console.log(`✅ Found ${prices.length} competitor prices for ${sku.sku_code}`)
            }
            
            analysisCount++
            
            // Rate limiting - be respectful
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Stop after getting some data to avoid long waits
            if (newCompetitorPrices.length >= 15) break
            
          } catch (productError) {
            console.error(`❌ Analysis failed for ${sku.sku_code}:`, productError)
            continue
          }
        }
        
        // Update competitive data with new results
        enhancedCompetitorData = [...competitorData, ...newCompetitorPrices]
        
        console.log(`✅ Auto-populated ${newCompetitorPrices.length} new competitor prices. Total: ${enhancedCompetitorData.length}`)
        
      } catch (autoPopulateError) {
        console.error('❌ Auto-populate competitive data failed:', autoPopulateError)
        // Continue with existing data
      }
    }

    // Step 3: Generate Claude AI competitive intelligence with enhanced data
    const claudeInsights = await generateClaudeCompetitiveIntelligence(
      enhancedCompetitorData,
      userSKUs,
      recentAnalyses
    )

    // Step 3: Get real-time monitoring recommendations
    const monitoringRecommendations = await generateClaudeMonitoringStrategy(
      userSKUs,
      competitorData
    )

    // Step 4: Generate portfolio health assessment
    const portfolioAssessment = await generateClaudePortfolioAssessment(
      userSKUs,
      competitorData,
      claudeInsights
    )

    return NextResponse.json({
      success: true,
      claude_insights: claudeInsights,
      monitoring_strategy: monitoringRecommendations,
      portfolio_assessment: portfolioAssessment,
      
      // Data context for Claude analysis
      data_context: {
        inventory_size: userSKUs.length,
        competitor_prices_analyzed: enhancedCompetitorData.length,
        unique_competitors: [...new Set(enhancedCompetitorData.map(c => c.competitor))].length,
        analysis_period: '7 days',
        total_revenue_at_risk: claudeInsights.reduce((sum, i) => sum + Math.abs(i.revenue_impact_estimate), 0),
        auto_populated_data: enhancedCompetitorData.length > competitorData.length,
        new_competitive_data_points: enhancedCompetitorData.length - competitorData.length
      },
      
      generated_at: new Date().toISOString(),
      powered_by: 'claude_ai_competitive_intelligence'
    })

  } catch (error) {
    console.error('Claude competitive intelligence error:', error)
    return NextResponse.json({
      error: 'Claude AI competitive analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * MAIN CLAUDE AI COMPETITIVE INTELLIGENCE ANALYSIS
 */
async function generateClaudeCompetitiveIntelligence(
  competitorData: any[],
  userSKUs: any[],
  recentAnalyses: any[]
): Promise<ClaudeInsight[]> {
  
  // Prepare comprehensive market data for Claude
  const marketAnalysis = {
    portfolio_overview: {
      total_products: userSKUs.length,
      categories: [...new Set(userSKUs.map(s => s.category))],
      average_price: userSKUs.reduce((sum, s) => sum + s.price, 0) / userSKUs.length,
      total_inventory_value: userSKUs.reduce((sum, s) => sum + (s.price * s.inventory_level), 0),
      fast_movers: userSKUs.filter(s => s.weekly_sales > 5).length,
      slow_movers: userSKUs.filter(s => s.weekly_sales < 1).length
    },
    
    competitive_landscape: {
      total_competitor_prices: competitorData.length,
      unique_competitors: [...new Set(competitorData.map(c => c.competitor))],
      price_variance_data: competitorData.map(c => ({
        sku: c.sku,
        competitor: c.competitor,
        our_price: c.our_price,
        their_price: c.competitor_price,
        difference_pct: c.price_difference_percentage,
        availability: c.availability
      })),
      
      // Key competitive threats
      major_underpricing: competitorData.filter(c => c.price_difference_percentage < -20),
      major_overpricing: competitorData.filter(c => c.price_difference_percentage > 20),
      stock_opportunities: competitorData.filter(c => !c.availability)
    },
    
    market_trends: {
      recent_price_changes: competitorData.filter(c => 
        new Date(c.last_updated) > new Date(Date.now() - 48 * 60 * 60 * 1000)
      ),
      promotional_activity: competitorData.filter(c => c.promotional).length,
      market_coverage: competitorData.length / userSKUs.length
    }
  }

  const prompt = `You are the world's leading alcohol retail competitive intelligence analyst. Analyze this comprehensive market data and provide 3-5 CRITICAL strategic insights with specific actions.

PORTFOLIO DATA:
${JSON.stringify(marketAnalysis, null, 2)}

For each critical insight, provide:
1. Strategic threat/opportunity analysis
2. Specific revenue impact estimates
3. Immediate tactical actions
4. Timeline for implementation

Focus on insights that could significantly impact revenue (£1000+ monthly impact). Be specific about which products, competitors, and actions.

Return as JSON array:
[
  {
    "type": "competitive_threat",
    "priority": "critical",
    "title": "Specific actionable title",
    "claude_analysis": "Detailed strategic analysis with specific numbers",
    "strategic_recommendations": ["Specific rec 1", "Specific rec 2"],
    "immediate_actions": ["Action 1 with timeline", "Action 2 with target"],
    "revenue_impact_estimate": 5000,
    "confidence_score": 0.9,
    "affected_products": ["Product1", "Product2"],
    "competitors_involved": ["Competitor1"],
    "market_context": "Specific market condition explanation",
    "urgency_timeline": "Within 48 hours"
  }
]

Make each insight ACTIONABLE with specific numbers, deadlines, and competitor names.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    
    if (jsonMatch) {
      const rawInsights = JSON.parse(jsonMatch[0])
      
      return rawInsights.map((insight: any, index: number) => ({
        id: `claude-insight-${Date.now()}-${index}`,
        type: insight.type || 'strategic_alert',
        priority: insight.priority || 'medium',
        title: insight.title || `Strategic Insight ${index + 1}`,
        claude_analysis: insight.claude_analysis || '',
        strategic_recommendations: insight.strategic_recommendations || [],
        immediate_actions: insight.immediate_actions || [],
        revenue_impact_estimate: insight.revenue_impact_estimate || 0,
        confidence_score: insight.confidence_score || 0.8,
        affected_products: insight.affected_products || [],
        competitors_involved: insight.competitors_involved || [],
        market_context: insight.market_context || '',
        urgency_timeline: insight.urgency_timeline || 'Within 1 week',
        timestamp: new Date()
      }))
    }

  } catch (error) {
    console.error('Claude competitive analysis failed:', error)
  }

  // Fallback insights if Claude fails
  return generateFallbackInsights(competitorData, userSKUs)
}

/**
 * CLAUDE AI MONITORING STRATEGY RECOMMENDATIONS
 */
async function generateClaudeMonitoringStrategy(
  userSKUs: any[],
  competitorData: any[]
): Promise<any> {
  
  const prompt = `As an alcohol retail competitive intelligence expert, recommend a monitoring strategy for this portfolio:

PORTFOLIO: ${userSKUs.length} products
CURRENT MONITORING: ${competitorData.length} competitor prices tracked

Recommend:
1. Which 10 products to monitor most closely (highest revenue impact)
2. Which competitors to track by priority
3. Monitoring frequency recommendations
4. Automated alert thresholds

Be specific about £ thresholds and monitoring intervals.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    })

    const analysis = response.content[0].type === 'text' ? response.content[0].text : ''
    
    return {
      claude_strategy: analysis,
      priority_products: userSKUs
        .sort((a, b) => (b.price * b.weekly_sales) - (a.price * a.weekly_sales))
        .slice(0, 10)
        .map(s => s.sku_code),
      
      recommended_frequency: 'Every 4 hours for top 10 products, daily for others',
      alert_thresholds: {
        critical_price_change: 15,
        medium_price_change: 8,
        stock_alert: true
      }
    }

  } catch (error) {
    console.error('Claude monitoring strategy failed:', error)
    return {
      claude_strategy: 'Monitor high-value, fast-moving products more frequently',
      priority_products: userSKUs.slice(0, 10).map(s => s.sku_code),
      recommended_frequency: 'Daily',
      alert_thresholds: { critical_price_change: 10 }
    }
  }
}

/**
 * CLAUDE AI PORTFOLIO HEALTH ASSESSMENT
 */
async function generateClaudePortfolioAssessment(
  userSKUs: any[],
  competitorData: any[],
  insights: ClaudeInsight[]
): Promise<any> {
  
  const portfolioMetrics = {
    total_products: userSKUs.length,
    competitive_coverage: Math.round((competitorData.length / userSKUs.length) * 100),
    critical_insights: insights.filter(i => i.priority === 'critical').length,
    total_revenue_impact: insights.reduce((sum, i) => sum + Math.abs(i.revenue_impact_estimate), 0),
    
    pricing_position: {
      overpriced: competitorData.filter(c => c.price_difference_percentage > 15).length,
      underpriced: competitorData.filter(c => c.price_difference_percentage < -15).length,
      competitive: competitorData.filter(c => Math.abs(c.price_difference_percentage) <= 15).length
    }
  }

  const prompt = `Assess this alcohol retail portfolio's competitive health and provide an executive summary:

PORTFOLIO METRICS:
${JSON.stringify(portfolioMetrics, null, 2)}

Provide:
1. Overall competitive health score (1-10)
2. Top 3 immediate threats
3. Top 3 opportunities
4. Executive summary for management

Be direct and specific about actions needed.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    })

    const assessment = response.content[0].type === 'text' ? response.content[0].text : ''
    
    return {
      health_score: calculateHealthScore(portfolioMetrics),
      claude_assessment: assessment,
      metrics: portfolioMetrics,
      generated_at: new Date().toISOString()
    }

  } catch (error) {
    console.error('Claude portfolio assessment failed:', error)
    return {
      health_score: 7,
      claude_assessment: 'Portfolio analysis requires Claude AI integration',
      metrics: portfolioMetrics
    }
  }
}

/**
 * Fallback insights when Claude is unavailable
 */
function generateFallbackInsights(competitorData: any[], userSKUs: any[]): ClaudeInsight[] {
  const insights: ClaudeInsight[] = []
  
  // Critical overpricing alert
  const overpriced = competitorData.filter(c => c.price_difference_percentage > 20)
  if (overpriced.length > 0) {
    const revenueAtRisk = overpriced.reduce((sum, c) => {
      const sku = userSKUs.find(s => s.sku_code === c.sku)
      return sum + (sku ? sku.price * sku.weekly_sales * 4.33 * 0.2 : 0)
    }, 0)
    
    insights.push({
      id: `fallback-overpriced-${Date.now()}`,
      type: 'competitive_threat',
      priority: 'critical',
      title: `${overpriced.length} Products Significantly Overpriced`,
      claude_analysis: 'Products priced 20%+ above competitors risk significant sales loss',
      strategic_recommendations: ['Immediate price review', 'Competitive price matching'],
      immediate_actions: ['Review pricing within 48 hours', 'Contact suppliers for cost analysis'],
      revenue_impact_estimate: Math.round(revenueAtRisk),
      confidence_score: 0.9,
      affected_products: overpriced.map(c => c.sku),
      competitors_involved: [...new Set(overpriced.map(c => c.competitor))],
      market_context: 'Multiple competitors offering lower prices',
      urgency_timeline: 'Within 48 hours',
      timestamp: new Date()
    })
  }
  
  return insights
}

function calculateHealthScore(metrics: any): number {
  let score = 10
  
  // Deduct for poor competitive coverage
  if (metrics.competitive_coverage < 30) score -= 3
  else if (metrics.competitive_coverage < 60) score -= 1
  
  // Deduct for pricing issues
  const pricingIssues = metrics.pricing_position.overpriced + metrics.pricing_position.underpriced
  const totalProducts = Object.values(metrics.pricing_position).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)
  const pricingIssueRate = pricingIssues / totalProducts
  
  if (pricingIssueRate > 0.3) score -= 2
  else if (pricingIssueRate > 0.15) score -= 1
  
  return Math.max(1, Math.min(10, score))
}
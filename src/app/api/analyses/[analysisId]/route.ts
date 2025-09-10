import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { analysisId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log(`Fetching analysis ${analysisId} for user ${userId}`)

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    if (!analysisId || analysisId === 'undefined' || analysisId === 'null') {
      return NextResponse.json({ error: 'Invalid analysis ID' }, { status: 400 })
    }

    // Try to get from database first
    try {
      const analysis = await PostgreSQLService.getAnalysisById(analysisId, userId)
      if (analysis) {
        console.log(`Found analysis in database: ${analysis.id}`)
        
        // Also fetch competitor data and market insights separately
        const [competitorData, alerts] = await Promise.all([
          PostgreSQLService.getCompetitorData(userId, 30),
          PostgreSQLService.getAlertsForAnalysisId(analysis.user_id, analysisId)
        ])
        
        return NextResponse.json(formatAnalysisResponse(analysis, competitorData, alerts))
      }
    } catch (dbError) {
      console.log('Database fetch failed, using fallback:', dbError)
    }

    // Database connection is failing - provide fallback response
    console.log(`Database connection issue for analysis ${analysisId}`)
    
    return NextResponse.json({
      error: 'Analysis not found',
      message: 'Database connection issue - analysis was processed but not saved',
      troubleshooting: {
        database_status: 'connection_failed',
        analysis_id: analysisId,
        user_id: userId,
        suggestion: 'Your analysis was processed successfully but database save failed. Try re-uploading your CSV file.',
        next_steps: [
          'Check your internet connection',
          'Re-upload the same CSV file',
          'Contact support if issue persists'
        ]
      }
    }, { status: 404 })

  } catch (error) {
    console.error('Analysis fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function formatAnalysisResponse(analysis: any, competitorData: any[] = [], alerts: any[] = []) {
  // Transform recommendations from database format to dashboard format
  const recommendations = analysis.recommendations?.map((rec: any) => ({
    sku: rec.sku_code,
    currentPrice: rec.current_price,
    recommendedPrice: rec.recommended_price,
    changePercentage: rec.change_percentage,
    confidence: rec.confidence_score,
    reason: rec.reason,
    weeklySales: rec.weekly_sales,
    inventoryLevel: rec.inventory_level,
    revenueImpact: rec.revenue_impact,
    category: 'spirits', // Default - would need SKU join for actual category
    brand: 'Unknown'    // Default - would need SKU join for actual brand
  })) || []

  // Filter competitor data to this analysis timeframe (rough approximation)
  const analysisCompetitorData = competitorData.filter(comp => {
    const compDate = new Date(comp.last_updated || comp.created_at)
    const analysisDate = new Date(analysis.processed_at || analysis.uploaded_at)
    const timeDiff = Math.abs(compDate.getTime() - analysisDate.getTime())
    return timeDiff < (24 * 60 * 60 * 1000) // Within 24 hours of analysis
  }).map(comp => ({
    sku: comp.sku,
    our_price: comp.our_price,
    competitor: comp.competitor,
    competitor_price: comp.competitor_price,
    price_difference: comp.price_difference,
    price_difference_percentage: comp.price_difference_percentage,
    availability: comp.availability,
    product_name: comp.product_name,
    relevance_score: comp.relevance_score,
    url: comp.url || '#'
  }))

  // Transform alerts from database format
  const criticalAlerts = alerts.map((alert: any) => ({
    id: alert.id,
    sku_code: alert.sku_code,
    severity: alert.severity,
    message: alert.message,
    estimated_impact: alert.revenue_at_risk,
    type: alert.type,
    urgency_score: alert.urgency_score,
    created_at: alert.created_at
  }))

  // Extract market insights from JSON field or generate some default ones
  let marketInsights = []
  
  try {
    marketInsights = analysis.market_insights || []
    
    // If no market insights stored, generate some based on available data
    if (marketInsights.length === 0 && (recommendations.length > 0 || analysisCompetitorData.length > 0)) {
      marketInsights = generateFallbackInsights(recommendations, analysisCompetitorData)
    }
  } catch (error) {
    console.error('Error parsing market insights:', error)
    marketInsights = generateFallbackInsights(recommendations, analysisCompetitorData)
  }

  return {
    analysisId: analysis.upload_id,
    summary: {
      totalSKUs: analysis.total_skus || 0,
      priceIncreases: recommendations.filter((r: any) => r.changePercentage > 0).length,
      priceDecreases: recommendations.filter((r: any) => r.changePercentage < 0).length,
      noChange: recommendations.filter((r: any) => r.changePercentage === 0).length,
      totalRevenuePotential: analysis.revenue_potential || 0,
      brandsIdentified: analysis.summary?.brandsIdentified || 0,
      competitorPricesFound: analysisCompetitorData.length,
      marketInsightsGenerated: marketInsights.length
    },
    recommendations,
    competitorData: analysisCompetitorData,
    marketInsights,
    criticalAlerts,
    processedAt: analysis.processed_at || analysis.uploaded_at
  }
}

// Generate fallback market insights when none are stored
function generateFallbackInsights(recommendations: any[], competitorData: any[]) {
  const insights = []
  
  // Pricing opportunity insight
  const underPricedProducts = recommendations.filter(r => r.changePercentage > 5)
  if (underPricedProducts.length > 0) {
    insights.push({
      id: `fallback-pricing-${Date.now()}`,
      type: 'pricing',
      priority: 'high',
      title: 'Pricing Optimization Opportunities',
      description: `Analysis identified ${underPricedProducts.length} products with pricing optimization potential. Strategic price adjustments could increase revenue by ${underPricedProducts.reduce((sum, p) => sum + (p.revenueImpact || 0), 0).toFixed(0)} per month.`,
      actionable_steps: [
        'Review high-impact pricing recommendations',
        'Implement gradual price increases over 4-6 weeks',
        'Monitor sales velocity after adjustments',
        'Focus on products with strong demand indicators'
      ]
    })
  }
  
  // Competitive positioning insight
  if (competitorData.length > 0) {
    const avgPriceDiff = competitorData.reduce((sum, c) => sum + Math.abs(c.price_difference_percentage || 0), 0) / competitorData.length
    insights.push({
      id: `fallback-competitive-${Date.now()}`,
      type: 'competitive',
      priority: 'medium',
      title: 'UK Market Competitive Analysis',
      description: `Competitive intelligence gathered from ${competitorData.length} data points across major UK alcohol retailers. Average price variance of ${avgPriceDiff.toFixed(1)}% indicates market positioning opportunities.`,
      actionable_steps: [
        'Review products with significant price differences vs competitors',
        'Develop channel-specific pricing strategies',
        'Monitor competitor promotional activities',
        'Consider premium positioning for underpriced quality products'
      ]
    })
  }
  
  // Portfolio health insight
  const slowMovers = recommendations.filter(r => r.weeklySales < 1)
  const fastMovers = recommendations.filter(r => r.weeklySales > 5)
  
  if (slowMovers.length > 0 || fastMovers.length > 0) {
    insights.push({
      id: `fallback-portfolio-${Date.now()}`,
      type: 'portfolio',
      priority: 'medium',
      title: 'Portfolio Performance Analysis',
      description: `Portfolio analysis reveals ${fastMovers.length} high-velocity products and ${slowMovers.length} slow-moving items. Optimizing product mix and inventory allocation could improve cash flow and reduce holding costs.`,
      actionable_steps: [
        'Increase marketing focus on high-velocity products',
        'Consider bundling or promotional strategies for slow movers',
        'Adjust inventory levels based on demand patterns',
        'Evaluate discontinuation of consistently poor performers'
      ]
    })
  }
  
  return insights
}
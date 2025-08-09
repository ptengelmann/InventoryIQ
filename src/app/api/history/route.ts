import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get recent analyses
    const recentAnalyses = await DatabaseService.getRecentAnalyses(limit)
    
    // Get dashboard stats
    const stats = await DatabaseService.getDashboardStats()
    
    // Calculate trends (comparing last 2 analyses if available)
    let trends = null
    if (recentAnalyses.length >= 2) {
      const latest = recentAnalyses[0]
      const previous = recentAnalyses[1]
      
      trends = {
        skuGrowth: latest.summary.totalSKUs - previous.summary.totalSKUs,
        revenueGrowth: latest.summary.totalRevenuePotential - previous.summary.totalRevenuePotential,
        riskChange: latest.summary.highRiskSKUs - previous.summary.highRiskSKUs,
        optimizationRate: latest.summary.priceIncreases + latest.summary.priceDecreases
      }
    }
    
    return NextResponse.json({
      success: true,
      stats,
      recentAnalyses,
      trends,
      hasHistory: recentAnalyses.length > 0
    })
    
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
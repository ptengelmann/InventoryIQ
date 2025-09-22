// src/app/api/history/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

// ✅ CRITICAL: Add these exports to fix dynamic server usage error
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // ✅ FIXED: Use request.nextUrl instead of request.url
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    
    if (!userId || !userEmail) {
      return NextResponse.json({
        error: 'User authentication required',
        hasHistory: false,
        stats: null,
        recentAnalyses: [],
        trends: null
      }, { status: 401 })
    }
    
    console.log(`Fetching history for user: ${userEmail}`)
    
    // Get recent analyses for this specific user
    const recentAnalyses = await DatabaseService.getRecentAnalyses(userId, limit)
    
    // Get dashboard stats for this specific user
    const stats = await DatabaseService.getDashboardStats(userId)
    
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
    
    console.log(`Found ${recentAnalyses.length} analyses for user ${userEmail}`)
    
    return NextResponse.json({
      success: true,
      stats,
      recentAnalyses,
      trends,
      hasHistory: recentAnalyses.length > 0,
      userId,
      userEmail
    })
    
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
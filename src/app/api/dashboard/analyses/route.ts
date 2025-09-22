// src/app/api/dashboard/analyses/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import { prisma } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    
    console.log(`📊 Fetching analyses for user: ${userId}`)
    
    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: userId }
    })
    
    if (!user) {
      console.log(`User not found: ${userId}`)
      return NextResponse.json({ 
        success: false,
        analyses: [],
        count: 0,
        error: 'User not found' 
      })
    }
    
    // CRITICAL FIX: Include seasonal_strategies in the query
    const analyses = await prisma.analysis.findMany({
      where: { user_id: user.id },
      orderBy: { processed_at: 'desc' },
      take: 10,
      include: {
        recommendations: {
          take: 5,
          orderBy: { revenue_impact: 'desc' }
        },
        alerts: {
          take: 3,
          where: { resolved: false },
          orderBy: { urgency_score: 'desc' }
        },
        // FIXED: Now including seasonal strategies
        seasonal_strategies: {
          orderBy: [
            { urgency: 'desc' },
            { estimated_revenue_impact: 'desc' }
          ]
        }
      }
    })
    
    console.log(`📊 Found ${analyses.length} analyses`)
    
    // Transform the data for the dashboard
    const transformedAnalyses = analyses.map((analysis: any) => {
      // Calculate seasonal metrics
      const seasonalRevenuePotential = analysis.seasonal_strategies?.reduce(
        (sum: number, s: any) => sum + (s.estimated_revenue_impact || 0), 
        0
      ) || 0
      
      const urgentSeasonalActions = analysis.seasonal_strategies?.filter(
        (s: any) => s.urgency === 'high' || s.urgency === 'critical'
      ).length || 0
      
      return {
        _id: analysis.id,
        uploadId: analysis.upload_id,
        fileName: analysis.file_name,
        uploadedAt: analysis.uploaded_at.toISOString(),
        processedAt: analysis.processed_at.toISOString(),
        summary: {
          ...analysis.summary,
          // Add seasonal metrics to summary
          seasonalStrategiesGenerated: analysis.seasonal_strategies?.length || 0,
          seasonalRevenuePotential,
          urgentSeasonalActions
        },
        recommendations: analysis.recommendations,
        alerts: analysis.alerts,
        // Include seasonal strategies in response
        seasonalStrategies: analysis.seasonal_strategies?.map((s: any) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          urgency: s.urgency,
          estimated_revenue_impact: s.estimated_revenue_impact,
          products_involved: s.products_involved || []
        })) || []
      }
    })
    
    console.log(`✅ Returning ${transformedAnalyses.length} analyses with seasonal data`)
    
    // Log seasonal strategy counts for debugging
    transformedAnalyses.forEach((a: any) => {
      if (a.seasonalStrategies?.length > 0) {
        console.log(`Analysis ${a.uploadId}: ${a.seasonalStrategies.length} seasonal strategies`)
      }
    })
    
    return NextResponse.json({
      success: true,
      analyses: transformedAnalyses,
      count: transformedAnalyses.length
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch analyses:', error)
    return NextResponse.json({
      error: 'Failed to fetch analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
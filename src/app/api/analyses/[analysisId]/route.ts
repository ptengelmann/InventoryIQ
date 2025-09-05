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
        return NextResponse.json(formatAnalysisResponse(analysis))
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

function formatAnalysisResponse(analysis: any) {
  return {
    analysisId: analysis.upload_id,
    summary: {
      totalSKUs: analysis.total_skus || 0,
      priceIncreases: analysis.recommendations?.filter((r: any) => r.change_percentage > 0).length || 0,
      priceDecreases: analysis.recommendations?.filter((r: any) => r.change_percentage < 0).length || 0,
      noChange: analysis.recommendations?.filter((r: any) => r.change_percentage === 0).length || 0,
      totalRevenuePotential: analysis.revenue_potential || 0,
      brandsIdentified: analysis.summary?.brandsIdentified || 0,
      competitorPricesFound: analysis.competitor_data?.length || 0,
      marketInsightsGenerated: analysis.market_insights?.length || 0
    },
    recommendations: analysis.recommendations || [],
    competitorData: analysis.competitor_data || [],
    marketInsights: analysis.market_insights || [],
    criticalAlerts: analysis.alerts || [],
    processedAt: analysis.processed_at || analysis.uploaded_at
  }
}
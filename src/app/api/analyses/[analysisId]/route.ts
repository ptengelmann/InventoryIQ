import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLService } from '@/lib/database-postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 });
    }
    
    const userIdentifier = userId || userEmail || '';
    const analysisId = params.analysisId;
    
    // Validate analysis ID
    if (!analysisId || analysisId === 'undefined') {
      console.log(`Invalid analysis ID: ${analysisId}`);
      return NextResponse.json({ 
        error: 'Invalid analysis ID' 
      }, { status: 400 });
    }
    
    console.log(`Fetching analysis details for ID: ${analysisId}, user: ${userIdentifier}`);
    
    // Get the analysis
    const analysis = await PostgreSQLService.getAnalysisById(analysisId, userIdentifier);
    
    if (!analysis) {
      console.log(`Analysis not found: ${analysisId}`);
      return NextResponse.json({ 
        error: 'Analysis not found' 
      }, { status: 404 });
    }
    
    // Ensure proper field names and handle date conversion
    return NextResponse.json({
      analysisId,
      summary: analysis.summary || {},
      recommendations: analysis.recommendations || [],
      competitorData: analysis.competitor_data || [],
      marketInsights: analysis.market_insights || [],
      criticalAlerts: analysis.alerts || [],
      processedAt: analysis.processed_at instanceof Date 
        ? analysis.processed_at.toISOString() 
        : analysis.processed_at
    });
    
  } catch (error) {
    console.error('Analysis details API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analysis details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
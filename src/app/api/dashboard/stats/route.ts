// src/app/api/dashboard/analyses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 })
    }
    
    const userIdentifier = userId || userEmail || ''
    console.log(`Getting recent analyses for user: ${userIdentifier}`)
    
    // Use existing method to get recent analyses
    const analyses = await PostgreSQLService.getRecentAnalyses(userIdentifier, limit)
    
    return NextResponse.json({
      analyses,
      count: analyses.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Recent analyses API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch recent analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
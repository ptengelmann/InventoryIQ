import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    
    const analyses = await PostgreSQLService.getRecentAnalyses(userId, 10)
    
    return NextResponse.json({
      success: true,
      analyses,
      count: analyses.length
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
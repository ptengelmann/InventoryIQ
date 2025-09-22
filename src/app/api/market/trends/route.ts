// NEW FILE: /src/app/api/market/trends/route.ts
// Market trends and intelligence

import { NextRequest, NextResponse } from 'next/server'
import { CompetitorIntelligenceService } from '@/lib/competitor-intelligence'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || 'all'
    const timePeriod = (searchParams.get('period') || 'weekly') as 'daily' | 'weekly' | 'monthly'
    
    const report = await CompetitorIntelligenceService.generateMarketReport(category, timePeriod)
    
    return NextResponse.json(report)
    
  } catch (error) {
    console.error('Error generating market report:', error)
    return NextResponse.json(
      { error: 'Failed to generate market intelligence report' },
      { status: 500 }
    )
  }
}
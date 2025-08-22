// NEW FILE: /src/app/api/external/sync/route.ts
// External data synchronization

import { NextRequest, NextResponse } from 'next/server'
import { CompetitorIntelligenceService } from '@/lib/competitor-intelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, skus, sources } = body
    
    switch (action) {
      case 'start_monitoring':
        if (!skus || !Array.isArray(skus)) {
          return NextResponse.json(
            { error: 'SKUs array is required for monitoring' },
            { status: 400 }
          )
        }
        
        // Start price monitoring (in production, would set up background jobs)
        await CompetitorIntelligenceService.startPriceMonitoring(skus, 60)
        
        return NextResponse.json({
          message: `Started monitoring ${skus.length} SKUs`,
          skus,
          check_interval_minutes: 60,
          started_at: new Date().toISOString()
        })
        
      case 'search_products':
        const { search_term, category } = body
        if (!search_term) {
          return NextResponse.json(
            { error: 'search_term is required' },
            { status: 400 }
          )
        }
        
        const searchResults = await CompetitorIntelligenceService.searchCompetitorProducts(
          search_term,
          category
        )
        
        return NextResponse.json({
          search_term,
          category,
          results: searchResults,
          total_found: searchResults.length,
          searched_at: new Date().toISOString()
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: start_monitoring, search_products' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in external sync:', error)
    return NextResponse.json(
      { error: 'Failed to process external sync request' },
      { status: 500 }
    )
  }
}
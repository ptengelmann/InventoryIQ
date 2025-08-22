// NEW FILE: /src/app/api/competitors/pricing/route.ts
// API route for competitor pricing data

import { NextRequest, NextResponse } from 'next/server'
import { CompetitorIntelligenceService } from '@/lib/competitor-intelligence'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    const sources = searchParams.get('sources')?.split(',') || ['total_wine', 'wine_com', 'bevmo']
    
    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter is required' },
        { status: 400 }
      )
    }
    
    // In production, would fetch from database
    const mockAlcoholSKU = {
      sku,
      price: '29.99',
      category: 'spirits',
      brand: 'Sample Brand',
      subcategory: 'Bourbon',
      abv: 40,
      volume_ml: 750
    }
    
    const competitorPrices = await CompetitorIntelligenceService.fetchCompetitorPrices(
      mockAlcoholSKU as any,
      sources
    )
    
    return NextResponse.json({
      sku,
      competitor_prices: competitorPrices,
      last_updated: new Date().toISOString(),
      sources_checked: sources
    })
    
  } catch (error) {
    console.error('Error fetching competitor prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor pricing data' },
      { status: 500 }
    )
  }
}
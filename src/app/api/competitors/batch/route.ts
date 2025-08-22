// NEW FILE: /src/app/api/competitors/batch/route.ts
// Batch competitor price comparison

import { NextRequest, NextResponse } from 'next/server'
import { CompetitorIntelligenceService } from '@/lib/competitor-intelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skus, sources = ['total_wine', 'wine_com', 'bevmo'] } = body
    
    if (!skus || !Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json(
        { error: 'SKUs array is required' },
        { status: 400 }
      )
    }
    
    if (skus.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 SKUs per batch request' },
        { status: 400 }
      )
    }
    
    // Mock alcohol SKUs for demo
    const mockAlcoholSKUs = skus.map((sku: string) => ({
      sku,
      price: (Math.random() * 50 + 10).toFixed(2),
      category: ['beer', 'wine', 'spirits'][Math.floor(Math.random() * 3)],
      brand: 'Sample Brand',
      subcategory: 'Sample Product',
      abv: 20 + Math.random() * 40,
      volume_ml: 750
    }))
    
    const results = await CompetitorIntelligenceService.batchPriceComparison(
      mockAlcoholSKUs as any,
      sources
    )
    
    // Calculate summary statistics
    const summary = {
      total_skus: results.length,
      overpriced_count: results.filter(r => r.recommendations.action === 'decrease').length,
      underpriced_count: results.filter(r => r.recommendations.action === 'increase').length,
      competitive_count: results.filter(r => r.recommendations.action === 'maintain').length,
      high_urgency_count: results.filter(r => r.recommendations.urgency === 'high').length,
      avg_price_advantage: results.reduce((sum, r) => sum + r.market_position.price_advantage, 0) / results.length
    }
    
    return NextResponse.json({
      results,
      summary,
      processed_at: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in batch price comparison:', error)
    return NextResponse.json(
      { error: 'Failed to process batch price comparison' },
      { status: 500 }
    )
  }
}
// Create /src/app/api/debug-scraping/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get('product') || 'Macallan 12'
    
    console.log(`🐛 DEBUG: Testing scraping for "${product}"`)
    
    // Test scraping with detailed logging
    const results = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
      product,
      'spirits',
      1  // Test just one retailer for debugging
    )
    
    // Also test the cache method
    const cachedResults = await RealCompetitiveScraping.getCachedOrScrape(
      product,
      'spirits',
      24
    )
    
    return NextResponse.json({
      debug_info: {
        product_searched: product,
        direct_scraping_results: results,
        cached_or_scrape_results: cachedResults,
        results_count: results.length,
        cached_count: cachedResults.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug scraping failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
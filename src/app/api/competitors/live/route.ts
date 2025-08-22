// src/app/api/competitors/live/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { scrapeCompetitorPrices } from '@/lib/scrapers/uk-alcohol-scraper'
import { CompetitorPrice } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { productName, category, brand, volume } = await request.json()
    
    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    console.log(`Live scraping request for: ${productName}`)
    
    // Scrape live prices from UK retailers
    const competitorPrices: CompetitorPrice[] = await scrapeCompetitorPrices(
      productName,
      category || 'alcohol',
      brand,
      volume
    )
    
    const response = {
      success: true,
      product: productName,
      timestamp: new Date().toISOString(),
      results_found: competitorPrices.length,
      competitors: competitorPrices.map(price => ({
        retailer: price.competitor,
        price: price.competitor_price,
        product_name: price.product_name,
        availability: price.availability,
        url: price.url,
        relevance_score: price.relevance_score
      })),
      scraping_sources: ['Majestic Wine', 'Waitrose', 'Tesco', 'ASDA'],
      rate_limited: competitorPrices.length === 0
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Live scraping error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Scraping failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for testing - FIXED FORMAT
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testProduct = searchParams.get('product') || 'Hendricks Gin'
  const category = searchParams.get('category') || 'spirits'
  
  try {
    console.log(`GET test for: ${testProduct}`)
    const competitorPrices = await scrapeCompetitorPrices(testProduct, category)
    
    // Return same format as POST endpoint
    return NextResponse.json({
      success: true,
      product: testProduct,
      timestamp: new Date().toISOString(),
      results_found: competitorPrices.length,
      competitors: competitorPrices.map(price => ({
        retailer: price.competitor,
        price: price.competitor_price,
        product_name: price.product_name,
        availability: price.availability,
        url: price.url,
        relevance_score: price.relevance_score
      })),
      scraping_sources: ['Majestic Wine', 'Waitrose', 'Tesco', 'ASDA'],
      rate_limited: false,
      test_mode: true
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      test_mode: true
    })
  }
}
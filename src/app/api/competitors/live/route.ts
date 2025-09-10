// src/app/api/competitors/live/route.ts
// CORRECTED VERSION - Fixed TypeScript errors

import { NextRequest, NextResponse } from 'next/server'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get('product')
    const category = searchParams.get('category') || 'spirits'
    const userId = searchParams.get('userId')
    const maxRetailers = parseInt(searchParams.get('maxRetailers') || '5')
    
    if (!product) {
      return NextResponse.json({ 
        error: 'Product name is required' 
      }, { status: 400 })
    }

    const userIdentifier = userId || 'demo-user'
    console.log(`🔍 Live competitor search: "${product}" for user ${userIdentifier}`)
    
    let competitors: any[] = []
    
    try {
      console.log(`🕷️ Scraping live competitor data from ${maxRetailers} retailers...`)
      
      // Get real competitor prices
      const scrapedPrices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
        product,
        category,
        maxRetailers
      )
      
      console.log(`✅ Scraped ${scrapedPrices.length} live competitor prices`)
      console.log('Raw scraped data:', scrapedPrices.map(p => ({
        competitor: p.competitor,
        price: p.competitor_price,
        product_name: p.product_name,
        relevance: p.relevance_score
      })))
      
      // Transform to expected format
      competitors = scrapedPrices.map(price => ({
        retailer: price.competitor,
        price: price.competitor_price,
        availability: price.availability,
        product_name: price.product_name || 'Unknown Product',
        url: price.url || '#',
        relevance_score: price.relevance_score || 0,
        last_updated: price.last_updated || new Date(),
        source: price.source || 'live_scraping'
      }))
      
      // Skip database saving for demo to avoid foreign key constraints
      console.log(`💾 Skipping database save for demo - found ${competitors.length} live prices`)
      
    } catch (scrapingError) {
      console.error('❌ Live scraping failed:', scrapingError)
      competitors = []
    }
    
    // If no competitors found, return helpful message
    if (competitors.length === 0) {
      return NextResponse.json({
        success: true,
        product,
        category,
        competitors: [],
        message: `No competitor prices found for "${product}". Try a different product name or check if it's available in UK retailers.`,
        suggestions: [
          'Try "Hendricks Gin" or "Macallan 12"',
          'Check spelling and try again',
          'Product may not be widely available'
        ],
        metadata: {
          processing_time_ms: Date.now() - startTime,
          scraped_at: new Date().toISOString(),
          retailers_searched: maxRetailers
        }
      })
    }
    
    // Calculate market insights
    const marketInsights = generateMarketInsights(competitors, product, category)
    
    const processingTime = Date.now() - startTime
    
    // Return successful response with real data
    return NextResponse.json({
      success: true,
      product,
      category,
      competitors,
      market_analysis: {
        competitor_count: competitors.length,
        price_range: competitors.length > 0 ? {
          min: Math.min(...competitors.map(c => c.price)),
          max: Math.max(...competitors.map(c => c.price)),
          average: Math.round((competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length) * 100) / 100
        } : null,
        retailer_coverage: [...new Set(competitors.map(c => c.retailer))],
        availability_rate: competitors.length > 0 ? 
          Math.round((competitors.filter(c => c.availability).length / competitors.length) * 100) : 0
      },
      insights: marketInsights,
      metadata: {
        processing_time_ms: processingTime,
        from_cache: false,
        scraped_at: new Date().toISOString(),
        retailers_searched: maxRetailers,
        scraping_method: 'real_scraping_with_serpapi'
      }
    })

  } catch (error) {
    console.error('❌ Live competitor API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch live competitor data',
      details: error instanceof Error ? error.message : 'Unknown error',
      product: request.nextUrl.searchParams.get('product'),
      suggestions: [
        'Check your internet connection',
        'Try a different product name',
        'Contact support if the issue persists'
      ]
    }, { status: 500 })
  }
}

// Generate market insights from competitor data
function generateMarketInsights(competitors: any[], product: string, category: string) {
  if (competitors.length === 0) {
    return {
      market_position: 'no_data',
      recommendations: [
        `No competitor data found for "${product}"`,
        'Try searching for a more common product name',
        'Check if the product is available in UK retailers'
      ],
      opportunities: [],
      data_quality: 'insufficient'
    }
  }
  
  const prices = competitors.map(c => c.price).filter(p => p > 0)
  if (prices.length === 0) {
    return {
      market_position: 'no_pricing_data',
      recommendations: ['Competitor products found but no valid prices extracted'],
      opportunities: [],
      data_quality: 'poor'
    }
  }
  
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const priceVariance = (priceRange / avgPrice) * 100
  
  const insights = {
    market_position: competitors.length >= 3 ? 'competitive_data_available' : 'limited_data',
    price_volatility: priceVariance > 15 ? 'high' : 'low',
    recommendations: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
    data_quality: competitors.length >= 3 ? 'good' : 'limited'
  }
  
  // Generate actionable recommendations based on real data
  insights.recommendations.push(`Average market price: £${avgPrice.toFixed(2)} across ${competitors.length} retailers`)
  insights.recommendations.push(`Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)} (${priceVariance.toFixed(1)}% variance)`)
  
  if (priceVariance > 20) {
    insights.opportunities.push(`High price variance (${priceVariance.toFixed(1)}%) suggests pricing flexibility`)
    insights.recommendations.push('Consider positioning in the middle-to-upper price range')
  } else {
    insights.recommendations.push('Stable pricing environment - focus on value differentiation')
  }
  
  // Retailer insights
  const retailers = competitors.map(c => c.retailer)
  const uniqueRetailers = [...new Set(retailers)]
  
  if (uniqueRetailers.length >= 3) {
    insights.recommendations.push(`Product available across ${uniqueRetailers.length} major retailers`)
    insights.opportunities.push('Strong distribution network')
  } else {
    insights.opportunities.push('Limited retail presence - potential for expansion')
  }
  
  // Best price opportunities
  const lowestPriceRetailer = competitors.find(c => c.price === minPrice)
  const highestPriceRetailer = competitors.find(c => c.price === maxPrice)
  
  if (lowestPriceRetailer && highestPriceRetailer) {
    insights.recommendations.push(`Lowest: ${lowestPriceRetailer.retailer} (£${minPrice.toFixed(2)})`)
    insights.recommendations.push(`Highest: ${highestPriceRetailer.retailer} (£${maxPrice.toFixed(2)})`)
  }
  
  return insights
}
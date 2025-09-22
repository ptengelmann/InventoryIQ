// src/app/api/competitors/live/route.ts
// FIXED VERSION - Real database saving + increased retailer limit

import { NextRequest, NextResponse } from 'next/server'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get('product')
    const category = searchParams.get('category') || 'spirits'
    const userId = searchParams.get('userId')
    const maxRetailers = parseInt(searchParams.get('maxRetailers') || '10') // INCREASED FROM 5 TO 10
    
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
      
      // Get real competitor prices with INCREASED retailer limit
      const scrapedPrices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
        product,
        category,
        maxRetailers, // Now 10 instead of 5
        true // Include AI insights
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
        source: price.source || 'live_scraping',
        promotional: price.promotional || false,
        promotion_details: price.promotion_details
      }))
      
      // FIXED: Actually save to database instead of skipping
      if (competitors.length > 0 && userId && userId !== 'demo-user') {
        try {
          console.log(`💾 SAVING ${competitors.length} competitor prices to database...`)
          
          // Transform competitors to the format expected by saveCompetitorPricesWithProduct
          const competitorPricesForDB = competitors.map(comp => ({
            sku: product.replace(/\s+/g, '-').toUpperCase(),
            competitor: comp.retailer,
            competitor_price: comp.price,
            our_price: 0, // Will be set when user has inventory data
            price_difference: 0,
            price_difference_percentage: 0,
            availability: comp.availability,
            product_name: comp.product_name,
            relevance_score: comp.relevance_score,
            url: comp.url,
            promotional: comp.promotional,
            promotion_details: comp.promotion_details,
            last_updated: new Date(),
            source: 'serp_api'
          }))
          
          await PostgreSQLService.saveCompetitorPricesWithProduct(
            userIdentifier, 
            product, 
            competitorPricesForDB
          )
          
          console.log(`✅ SUCCESSFULLY SAVED ${competitors.length} real competitor prices to database`)
          
        } catch (saveError) {
          console.error('❌ Failed to save competitor prices:', saveError)
          // Don't fail the entire request, just log the error
        }
      } else {
        console.log(`💾 Skipping database save: ${competitors.length} competitors, userId: ${userId}`)
      }
      
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
          'Try "Grey Goose Vodka" or "Macallan 12 Whisky"',
          'Include brand name and product type',
          'Check spelling and try variations'
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
      database_saved: competitors.length > 0 && userId && userId !== 'demo-user',
      metadata: {
        processing_time_ms: processingTime,
        from_cache: false,
        scraped_at: new Date().toISOString(),
        retailers_searched: maxRetailers,
        scraping_method: 'serp_api_with_ai_insights',
        retailers_found: competitors.length
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
        'Verify SERP API key is configured',
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
        'Include brand name in search (e.g., "Grey Goose Vodka")',
        'Check if the product is available in UK retailers'
      ],
      opportunities: [],
      threats: [],
      data_quality: 'insufficient'
    }
  }
  
  const prices = competitors.map(c => c.price).filter(p => p > 0)
  if (prices.length === 0) {
    return {
      market_position: 'no_pricing_data',
      recommendations: ['Competitor products found but no valid prices extracted'],
      opportunities: [],
      threats: [],
      data_quality: 'poor'
    }
  }
  
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const priceVariance = (priceRange / avgPrice) * 100
  
  const promotionalCount = competitors.filter(c => c.promotional).length
  const availabilityRate = (competitors.filter(c => c.availability).length / competitors.length) * 100
  
  const insights = {
    market_position: competitors.length >= 3 ? 'competitive_data_available' : 'limited_data',
    price_volatility: priceVariance > 15 ? 'high' : priceVariance > 8 ? 'medium' : 'low',
    recommendations: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
    data_quality: competitors.length >= 3 ? 'good' : competitors.length >= 1 ? 'fair' : 'poor'
  }
  
  // Generate actionable recommendations based on real data
  insights.recommendations.push(`Market average: £${avgPrice.toFixed(2)} across ${competitors.length} retailers`)
  insights.recommendations.push(`Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)} (${priceVariance.toFixed(1)}% variance)`)
  
  if (priceVariance > 20) {
    insights.opportunities.push(`High price variance (${priceVariance.toFixed(1)}%) indicates pricing flexibility`)
    insights.recommendations.push('Consider positioning in middle-to-upper price range for optimal margins')
  } else if (priceVariance < 5) {
    insights.recommendations.push('Very stable pricing - compete on value proposition rather than price')
    insights.threats.push('Limited pricing flexibility due to market standardization')
  } else {
    insights.recommendations.push('Moderate price variance allows for strategic positioning')
  }
  
  // Promotional activity analysis
  if (promotionalCount > 0) {
    insights.threats.push(`${promotionalCount} retailers running promotions - competitive pressure detected`)
    insights.recommendations.push('Monitor promotional activity and consider defensive pricing')
  } else {
    insights.opportunities.push('No active promotions detected - pricing opportunity available')
  }
  
  // Availability analysis
  if (availabilityRate < 80) {
    insights.opportunities.push(`${(100-availabilityRate).toFixed(0)}% of retailers out of stock - supply opportunity`)
  }
  
  // Retailer insights
  const retailers = competitors.map(c => c.retailer)
  const uniqueRetailers = [...new Set(retailers)]
  
  if (uniqueRetailers.length >= 5) {
    insights.opportunities.push(`Strong market presence across ${uniqueRetailers.length} major retailers`)
    insights.recommendations.push('Product has established distribution network')
  } else if (uniqueRetailers.length >= 3) {
    insights.recommendations.push(`Available at ${uniqueRetailers.length} retailers - moderate market presence`)
    insights.opportunities.push('Potential for expanded distribution')
  } else {
    insights.opportunities.push('Limited retail presence - significant expansion opportunity')
    insights.recommendations.push('Focus on securing additional retail partnerships')
  }
  
  // Price positioning insights
  const lowestPriceRetailer = competitors.find(c => c.price === minPrice)
  const highestPriceRetailer = competitors.find(c => c.price === maxPrice)
  
  if (lowestPriceRetailer && highestPriceRetailer && lowestPriceRetailer.retailer !== highestPriceRetailer.retailer) {
    insights.recommendations.push(`Price leader: ${lowestPriceRetailer.retailer} (£${minPrice.toFixed(2)})`)
    insights.recommendations.push(`Premium positioning: ${highestPriceRetailer.retailer} (£${maxPrice.toFixed(2)})`)
    
    // Strategic recommendations based on retailer positioning
    if (uniqueRetailers.includes('Waitrose') || uniqueRetailers.includes('Majestic Wine')) {
      insights.opportunities.push('Premium retailers present - opportunity for premium positioning')
    }
    if (uniqueRetailers.includes('ASDA') || uniqueRetailers.includes('Tesco')) {
      insights.opportunities.push('Value retailers present - opportunity for volume-based pricing')
    }
  }
  
  return insights
}
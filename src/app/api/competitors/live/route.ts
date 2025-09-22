// src/app/api/competitors/live/route.ts
// ENHANCED VERSION - Now connects to user inventory for real competitive intelligence

import { NextRequest, NextResponse } from 'next/server'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'
import { PostgreSQLService } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'


interface UserSKU {
  sku_code: string
  product_name?: string
  brand?: string
  category: string
  price: number
  weekly_sales?: number
  inventory_level?: number
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = request.nextUrl
    const product = searchParams.get('product')
    const category = searchParams.get('category') || 'spirits'
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const maxRetailers = parseInt(searchParams.get('maxRetailers') || '10')
    
    if (!product) {
      return NextResponse.json({ 
        error: 'Product name is required' 
      }, { status: 400 })
    }

    const userIdentifier = userId || userEmail || 'demo-user'
    console.log(`🔍 Live competitor search: "${product}" for user ${userIdentifier}`)
    
    let competitors: any[] = []
    let matchedInventoryItem: UserSKU | null = null
    let inventoryMatchConfidence = 0
    
    try {
      console.log(`🕷️ Scraping live competitor data from ${maxRetailers} retailers...`)
      
      // Get real competitor prices
      const scrapedPrices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
        product,
        category,
        maxRetailers,
        true // Include AI insights
      )
      
      console.log(`✅ Scraped ${scrapedPrices.length} live competitor prices`)
      
      // CRITICAL NEW FEATURE: Match against user's inventory
      if (userIdentifier && userIdentifier !== 'demo-user') {
        try {
          console.log(`📦 Checking user inventory for matches...`)
          const userSKUs = await PostgreSQLService.getUserSKUs(userIdentifier)
          console.log(`Found ${userSKUs.length} SKUs in user inventory`)
          
          if (userSKUs.length > 0) {
            const inventoryMatch = findBestInventoryMatch(product, userSKUs)
            
            if (inventoryMatch.sku && inventoryMatch.confidence > 0.3) {
              matchedInventoryItem = inventoryMatch.sku
              inventoryMatchConfidence = inventoryMatch.confidence
              console.log(`✅ INVENTORY MATCH: ${matchedInventoryItem.sku_code} (${Math.round(inventoryMatchConfidence * 100)}% confidence)`)
            }
          }
        } catch (inventoryError) {
          console.error('⚠️ Inventory matching failed:', inventoryError)
        }
      }
      
      // Transform competitor data with inventory context
      competitors = scrapedPrices.map(price => {
        const ourPrice = matchedInventoryItem?.price || 0
        const competitorPrice = price.competitor_price
        const priceDifference = competitorPrice - ourPrice
        const priceDifferencePercentage = ourPrice > 0 ? (priceDifference / ourPrice) * 100 : 0
        
        return {
          retailer: price.competitor,
          price: competitorPrice,
          availability: price.availability,
          product_name: price.product_name || 'Unknown Product',
          url: price.url || '#',
          relevance_score: price.relevance_score || 0,
          last_updated: price.last_updated || new Date(),
          source: price.source || 'live_scraping',
          promotional: price.promotional || false,
          promotion_details: price.promotion_details,
          
          // NEW: Inventory comparison data
          our_price: ourPrice,
          price_difference: priceDifference,
          price_difference_percentage: priceDifferencePercentage,
          inventory_match_confidence: inventoryMatchConfidence,
          matched_sku: matchedInventoryItem?.sku_code || null
        }
      })
      
      // Save to database with inventory context
      if (competitors.length > 0 && userIdentifier && userIdentifier !== 'demo-user') {
        try {
          console.log(`💾 SAVING ${competitors.length} competitor prices with inventory context...`)
          
          const competitorPricesForDB = competitors.map(comp => ({
            sku: matchedInventoryItem?.sku_code || product.replace(/\s+/g, '-').toUpperCase(),
            competitor: comp.retailer,
            competitor_price: comp.price,
            our_price: comp.our_price,
            price_difference: comp.price_difference,
            price_difference_percentage: comp.price_difference_percentage,
            availability: comp.availability,
            product_name: comp.product_name,
            relevance_score: comp.relevance_score,
            url: comp.url,
            promotional: comp.promotional,
            promotion_details: comp.promotion_details,
            last_updated: new Date(),
            source: 'serp_api',
            // NEW: Inventory matching metadata
            sku_match_confidence: inventoryMatchConfidence,
            our_actual_price: matchedInventoryItem?.price || null,
            last_inventory_sync: new Date()
          }))
          
          await PostgreSQLService.saveCompetitorPricesWithProduct(
            userIdentifier, 
            product, 
            competitorPricesForDB
          )
          
          console.log(`✅ SUCCESSFULLY SAVED competitor prices with inventory matching`)
          
        } catch (saveError) {
          console.error('❌ Failed to save competitor prices:', saveError)
        }
      }
      
    } catch (scrapingError) {
      console.error('❌ Live scraping failed:', scrapingError)
      competitors = []
    }
    
    // Enhanced market insights with inventory context
    const marketInsights = generateInventoryAwareInsights(competitors, product, category, matchedInventoryItem)
    
    const processingTime = Date.now() - startTime
    
    // Return enhanced response with inventory intelligence
    return NextResponse.json({
      success: true,
      product,
      category,
      competitors,
      
      // NEW: Inventory intelligence
      inventory_intelligence: {
        has_inventory_match: !!matchedInventoryItem,
        matched_sku: matchedInventoryItem?.sku_code || null,
        our_price: matchedInventoryItem?.price || null,
        match_confidence: Math.round(inventoryMatchConfidence * 100),
        competitive_positioning: matchedInventoryItem ? calculateMarketPosition(matchedInventoryItem.price, competitors) : null,
        strategic_recommendation: matchedInventoryItem ? generateStrategicRecommendation(matchedInventoryItem, competitors) : null
      },
      
      market_analysis: {
        competitor_count: competitors.length,
        price_range: competitors.length > 0 ? {
          min: Math.min(...competitors.map(c => c.price)),
          max: Math.max(...competitors.map(c => c.price)),
          average: Math.round((competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length) * 100) / 100
        } : null,
        retailer_coverage: [...new Set(competitors.map(c => c.retailer))],
        availability_rate: competitors.length > 0 ? 
          Math.round((competitors.filter(c => c.availability).length / competitors.length) * 100) : 0,
        
        // NEW: Market position analysis
        our_market_position: matchedInventoryItem ? {
          rank: calculateMarketPosition(matchedInventoryItem.price, competitors).rank,
          percentile: calculateMarketPosition(matchedInventoryItem.price, competitors).percentile,
          price_advantage: calculateMarketPosition(matchedInventoryItem.price, competitors).price_advantage
        } : null
      },
      
      insights: marketInsights,
      database_saved: competitors.length > 0 && userIdentifier && userIdentifier !== 'demo-user',
      
      metadata: {
        processing_time_ms: processingTime,
        from_cache: false,
        scraped_at: new Date().toISOString(),
        retailers_searched: maxRetailers,
        scraping_method: 'serp_api_with_inventory_matching',
        retailers_found: competitors.length,
        inventory_enhanced: !!matchedInventoryItem
      }
    })

  } catch (error) {
    console.error('❌ Enhanced competitor API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch competitive intelligence',
      details: error instanceof Error ? error.message : 'Unknown error',
      product: request.nextUrl.searchParams.get('product'),
      suggestions: [
        'Check your internet connection',
        'Verify SERP API key is configured',
        'Upload inventory CSV for enhanced competitive intelligence',
        'Try a different product name'
      ]
    }, { status: 500 })
  }
}

/**
 * NEW: Find best matching SKU from user's inventory
 */
function findBestInventoryMatch(searchProduct: string, userSKUs: UserSKU[]): { sku: UserSKU | null, confidence: number } {
  if (!userSKUs.length) return { sku: null, confidence: 0 }
  
  const searchTerms = searchProduct.toLowerCase().split(/\s+/)
  let bestMatch: UserSKU | null = null
  let highestScore = 0
  
  for (const sku of userSKUs) {
    let score = 0
    const skuText = `${sku.product_name || ''} ${sku.brand || ''} ${sku.sku_code || ''}`.toLowerCase()
    
    // Exact brand matches get high score
    for (const term of searchTerms) {
      if (term.length > 2) { // Ignore short words
        if (skuText.includes(term)) {
          score += term.length > 4 ? 0.3 : 0.2 // Longer terms get more weight
        }
      }
    }
    
    // Brand name matching boost
    if (sku.brand && searchProduct.toLowerCase().includes(sku.brand.toLowerCase())) {
      score += 0.4
    }
    
    // Category matching
    if (sku.category && searchProduct.toLowerCase().includes(sku.category)) {
      score += 0.1
    }
    
    // Exact SKU code match (highest priority)
    if (sku.sku_code && searchProduct.toLowerCase().includes(sku.sku_code.toLowerCase())) {
      score += 0.5
    }
    
    if (score > highestScore) {
      highestScore = score
      bestMatch = sku
    }
  }
  
  return { sku: bestMatch, confidence: Math.min(highestScore, 1.0) }
}

/**
 * NEW: Calculate market position with inventory context
 */
function calculateMarketPosition(ourPrice: number, competitors: any[]) {
  if (!competitors.length) return { rank: 1, percentile: 50, price_advantage: 0 }
  
  const allPrices = [ourPrice, ...competitors.map(c => c.price)].sort((a, b) => a - b)
  const ourRank = allPrices.indexOf(ourPrice) + 1
  const percentile = ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100
  
  const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length
  const priceAdvantage = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100
  
  return {
    rank: ourRank,
    percentile: Math.round(percentile),
    price_advantage: Math.round(priceAdvantage * 100) / 100
  }
}

/**
 * NEW: Generate strategic recommendation with inventory context
 */
function generateStrategicRecommendation(matchedSKU: UserSKU, competitors: any[]) {
  if (!competitors.length) return null
  
  const ourPrice = matchedSKU.price
  const avgPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length
  const priceAdvantage = ((ourPrice - avgPrice) / avgPrice) * 100
  
  let action: 'maintain' | 'increase' | 'decrease' | 'investigate' = 'maintain'
  let reasoning = 'Competitively positioned'
  let urgency: 'low' | 'medium' | 'high' = 'low'
  let targetPrice: number | undefined
  let revenueImpact = 0
  
  if (priceAdvantage > 15) {
    action = 'decrease'
    targetPrice = avgPrice * 1.05 // 5% above market average
    reasoning = `${priceAdvantage.toFixed(1)}% above market average - risk of lost sales`
    urgency = 'medium'
    
    if (matchedSKU.weekly_sales) {
      revenueImpact = (ourPrice - targetPrice) * matchedSKU.weekly_sales * -4.33 // Negative because price decrease
    }
  } else if (priceAdvantage < -10 && matchedSKU.category === 'spirits') {
    action = 'increase'
    targetPrice = avgPrice * 0.95 // 5% below market average
    reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - pricing opportunity for premium spirits`
    urgency = 'low'
    
    if (matchedSKU.weekly_sales) {
      revenueImpact = (targetPrice - ourPrice) * matchedSKU.weekly_sales * 4.33
    }
  } else if (priceAdvantage < -15) {
    action = 'increase'
    targetPrice = avgPrice * 0.98
    reasoning = `Significantly underpriced - gradual increase recommended`
    urgency = 'medium'
    
    if (matchedSKU.weekly_sales) {
      revenueImpact = (targetPrice - ourPrice) * matchedSKU.weekly_sales * 4.33
    }
  }
  
  return {
    action,
    target_price: targetPrice,
    reasoning,
    urgency,
    revenue_impact: Math.round(revenueImpact),
    weekly_sales: matchedSKU.weekly_sales || 0,
    current_inventory: matchedSKU.inventory_level || 0
  }
}

/**
 * Enhanced market insights with inventory awareness
 */
function generateInventoryAwareInsights(competitors: any[], product: string, category: string, matchedInventoryItem: UserSKU | null) {
  const baseInsights = generateMarketInsights(competitors, product, category)
  
  if (!matchedInventoryItem || competitors.length === 0) {
    return {
      ...baseInsights,
      inventory_context: 'No inventory match found - upload inventory CSV for strategic pricing insights'
    }
  }
  
  const ourPrice = matchedInventoryItem.price
  const competitorPrices = competitors.map(c => c.price)
  const avgPrice = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length
  const marketPosition = calculateMarketPosition(ourPrice, competitors)
  
  const enhancedRecommendations = [...baseInsights.recommendations]
  
  // Add inventory-specific insights
  if (marketPosition.price_advantage > 20) {
    enhancedRecommendations.unshift(`🚨 URGENT: Your price (£${ourPrice.toFixed(2)}) is ${marketPosition.price_advantage.toFixed(1)}% above market average`)
    enhancedRecommendations.push('Consider immediate price adjustment to prevent sales loss')
  } else if (marketPosition.price_advantage < -20) {
    enhancedRecommendations.unshift(`💰 OPPORTUNITY: Your price is ${Math.abs(marketPosition.price_advantage).toFixed(1)}% below market - significant pricing power`)
    if (matchedInventoryItem.weekly_sales) {
      const potentialRevenue = (avgPrice * 0.95 - ourPrice) * matchedInventoryItem.weekly_sales * 4.33
      enhancedRecommendations.push(`Potential monthly revenue increase: £${Math.round(potentialRevenue).toLocaleString()}`)
    }
  }
  
  // Inventory-specific opportunities
  if (matchedInventoryItem.inventory_level && matchedInventoryItem.weekly_sales) {
    const weeksOfStock = matchedInventoryItem.inventory_level / matchedInventoryItem.weekly_sales
    
    if (weeksOfStock > 12) {
      enhancedRecommendations.push(`High inventory levels (${weeksOfStock.toFixed(1)} weeks) - consider promotional pricing`)
    } else if (weeksOfStock < 3) {
      enhancedRecommendations.push(`Low inventory (${weeksOfStock.toFixed(1)} weeks) - pricing power opportunity`)
    }
  }
  
  return {
    ...baseInsights,
    inventory_context: `Matched to your SKU: ${matchedInventoryItem.sku_code}`,
    your_price: ourPrice,
    market_position: `Rank ${marketPosition.rank} of ${competitors.length + 1} retailers`,
    strategic_insights: enhancedRecommendations
  }
}

// Keep the original generateMarketInsights function for fallback
function generateMarketInsights(competitors: any[], product: string, category: string) {
  if (competitors.length === 0) {
    return {
      market_position: 'no_data',
      recommendations: [
        `No competitor data found for "${product}"`,
        'Try searching for a more common product name',
        'Include brand name in search (e.g., "Grey Goose Vodka")'
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
  
  insights.recommendations.push(`Market average: £${avgPrice.toFixed(2)} across ${competitors.length} retailers`)
  insights.recommendations.push(`Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)} (${priceVariance.toFixed(1)}% variance)`)
  
  if (priceVariance > 20) {
    insights.opportunities.push(`High price variance indicates pricing flexibility`)
  } else if (priceVariance < 5) {
    insights.threats.push('Limited pricing flexibility due to market standardization')
  }
  
  if (promotionalCount > 0) {
    insights.threats.push(`${promotionalCount} retailers running promotions`)
  } else {
    insights.opportunities.push('No active promotions detected')
  }
  
  return insights
}
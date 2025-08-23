// /src/app/api/competitors/live/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { scrapeCompetitorPrices } from '@/lib/scrapers/uk-alcohol-scraper'
import { DatabaseService } from '@/lib/models'
import { CompetitorPrice } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { productName, category, brand, volume, userEmail, userId } = await request.json()
        
    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    console.log(`Live scraping request for: ${productName}`)
        
    // Try to find uploaded price for this product first
    let ourPrice = 0
    let matchingUploadedSKU = null
    
    if (userEmail && userId) {
      try {
        const recentAnalyses = await DatabaseService.getRecentAnalyses(userId, 10)
        for (const analysis of recentAnalyses) {
          const matchingRecommendation = analysis.priceRecommendations.find(rec => 
            rec.sku.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(rec.sku.toLowerCase()) ||
            (brand && rec.sku.toLowerCase().includes(brand.toLowerCase()))
          )
          if (matchingRecommendation) {
            ourPrice = matchingRecommendation.currentPrice
            matchingUploadedSKU = matchingRecommendation.sku
            console.log(`Found uploaded price for ${productName}: £${ourPrice} (SKU: ${matchingUploadedSKU})`)
            break
          }
        }
      } catch (dbError) {
        console.log('Could not fetch uploaded prices:', dbError)
      }
    }

    // Scrape live prices from UK retailers
    const competitorPrices: CompetitorPrice[] = await scrapeCompetitorPrices(
      productName,
      category || 'alcohol',
      brand,
      volume
    )

    // Update competitor prices with our found price
    const updatedCompetitorPrices = competitorPrices.map(price => ({
      ...price,
      our_price: ourPrice,
      price_difference: ourPrice > 0 ? price.competitor_price - ourPrice : 0,
      price_difference_percentage: ourPrice > 0 ? ((price.competitor_price - ourPrice) / ourPrice) * 100 : 0
    }))

    const response = {
      success: true,
      product: productName,
      timestamp: new Date().toISOString(),
      results_found: updatedCompetitorPrices.length,
      our_price: ourPrice,
      our_sku: matchingUploadedSKU,
      price_found_in_uploads: ourPrice > 0,
      competitors: updatedCompetitorPrices.map(price => ({
        retailer: price.competitor,
        price: price.competitor_price,
        product_name: price.product_name,
        availability: price.availability,
        url: price.url,
        relevance_score: price.relevance_score,
        price_difference: price.price_difference,
        price_difference_percentage: price.price_difference_percentage
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testProduct = searchParams.get('product') || 'Hendricks Gin'
  const category = searchParams.get('category') || 'spirits'
  const userEmail = searchParams.get('userEmail')
  const userId = searchParams.get('userId')
    
  try {
    console.log(`GET test for: ${testProduct}`)
    
    // Try to find uploaded price for this product first
    let ourPrice = 0
    let matchingUploadedSKU = null
    
    if (userEmail && userId) {
      try {
        const recentAnalyses = await DatabaseService.getRecentAnalyses(userId, 10)
        console.log(`Checking ${recentAnalyses.length} recent analyses for ${testProduct}`)
        
        for (const analysis of recentAnalyses) {
          const matchingRecommendation = analysis.priceRecommendations.find(rec => {
            const skuMatch = rec.sku.toLowerCase().includes(testProduct.toLowerCase()) ||
                           testProduct.toLowerCase().includes(rec.sku.toLowerCase())
            console.log(`Comparing "${rec.sku}" with "${testProduct}": ${skuMatch}`)
            return skuMatch
          })
          
          if (matchingRecommendation) {
            ourPrice = matchingRecommendation.currentPrice
            matchingUploadedSKU = matchingRecommendation.sku
            console.log(`✅ Found uploaded price for ${testProduct}: £${ourPrice} (SKU: ${matchingUploadedSKU})`)
            break
          }
        }
        
        if (ourPrice === 0) {
          console.log(`❌ No matching price found for "${testProduct}" in uploaded data`)
          console.log('Available SKUs in recent analyses:', 
            recentAnalyses.flatMap(a => a.priceRecommendations.slice(0, 3).map(r => r.sku))
          )
        }
      } catch (dbError) {
        console.log('Could not fetch uploaded prices:', dbError)
      }
    }
    
    const competitorPrices = await scrapeCompetitorPrices(testProduct, category)
    
    // Update competitor prices with our found price
    const updatedCompetitorPrices = competitorPrices.map(price => ({
      ...price,
      our_price: ourPrice,
      price_difference: ourPrice > 0 ? price.competitor_price - ourPrice : 0,
      price_difference_percentage: ourPrice > 0 ? ((price.competitor_price - ourPrice) / ourPrice) * 100 : 0
    }))
        
    return NextResponse.json({
      success: true,
      product: testProduct,
      timestamp: new Date().toISOString(),
      results_found: updatedCompetitorPrices.length,
      our_price: ourPrice,
      our_sku: matchingUploadedSKU,
      price_found_in_uploads: ourPrice > 0,
      competitors: updatedCompetitorPrices.map(price => ({
        retailer: price.competitor,
        price: price.competitor_price,
        product_name: price.product_name,
        availability: price.availability,
        url: price.url,
        relevance_score: price.relevance_score,
        price_difference: price.price_difference,
        price_difference_percentage: price.price_difference_percentage
      })),
      scraping_sources: ['Majestic Wine', 'Waitrose', 'Tesco', 'ASDA'],
      rate_limited: false,
      test_mode: true,
      debug: {
        userProvided: !!userEmail,
        analysesChecked: userEmail ? 'attempted' : 'skipped'
      }
    })
      
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      test_mode: true
    })
  }
}
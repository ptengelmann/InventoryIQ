// src/app/api/competitors/live/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface CompetitorResult {
  retailer: string
  price: number
  availability: boolean
  url?: string
  product_name?: string
  relevance_score?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get('product')
    const category = searchParams.get('category') || 'spirits'
    const userEmail = searchParams.get('userEmail')
    const userId = searchParams.get('userId')
    
    if (!product) {
      return NextResponse.json({ 
        error: 'Product name required' 
      }, { status: 400 })
    }
    
    console.log(`🔍 Searching for "${product}" in category: ${category}`)
    
    // Check if user has uploaded inventory with this product
    let ourPrice = 0
    let priceFoundInUploads = false
    
    if (userEmail || userId) {
      // In production, this would query the user's SKU database
      // For now, simulate finding the product in user's inventory
      const normalizedProduct = product.toLowerCase()
      
      // Simulate finding user's price for common products
      if (normalizedProduct.includes('hendricks') || normalizedProduct.includes('hendrick')) {
        ourPrice = 42.99
        priceFoundInUploads = true
      } else if (normalizedProduct.includes('macallan')) {
        ourPrice = 89.99
        priceFoundInUploads = true
      } else if (normalizedProduct.includes('brewdog') || normalizedProduct.includes('punk')) {
        ourPrice = 3.99
        priceFoundInUploads = true
      }
    }
    
    // Always generate competitor data, even for unknown products
    // This ensures we show realistic data in the dashboard
    const competitors = await simulateCompetitorSearch(product, category)
    
    console.log(`📊 Found ${competitors.length} competitor prices`)
    
    return NextResponse.json({
      success: true,
      product,
      category,
      our_price: ourPrice,
      price_found_in_uploads: priceFoundInUploads,
      competitors,
      search_timestamp: new Date().toISOString(),
      data_source: 'simulated_uk_retailers'
    })
    
  } catch (error) {
    console.error('Live competitor search error:', error)
    return NextResponse.json({
      error: 'Failed to fetch competitor data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Simulate realistic competitor pricing with guaranteed results
async function simulateCompetitorSearch(
  product: string, 
  category: string
): Promise<CompetitorResult[]> {
  
  const retailers = [
    'Majestic Wine',
    'Waitrose', 
    'Tesco',
    'ASDA',
    'Sainsbury\'s'
  ]
  
  const results: CompetitorResult[] = []
  const normalizedProduct = product.toLowerCase()
  
  // Base price estimation based on product type
  let basePrice = 25 // Default spirits price
  
  if (normalizedProduct.includes('hendricks') || normalizedProduct.includes('hendrick')) {
    basePrice = 42
  } else if (normalizedProduct.includes('macallan')) {
    basePrice = 85
  } else if (normalizedProduct.includes('brewdog') || normalizedProduct.includes('punk')) {
    basePrice = 3.5
  } else if (normalizedProduct.includes('gin')) {
    basePrice = 28
  } else if (normalizedProduct.includes('whisky') || normalizedProduct.includes('whiskey')) {
    basePrice = 45
  } else if (normalizedProduct.includes('beer') || normalizedProduct.includes('ipa')) {
    basePrice = 4
  } else if (normalizedProduct.includes('wine')) {
    basePrice = 12
  } else if (normalizedProduct.includes('vodka')) {
    basePrice = 35
  } else if (normalizedProduct.includes('rum')) {
    basePrice = 30
  } else if (normalizedProduct.includes('tequila')) {
    basePrice = 40
  } else if (normalizedProduct.includes('brandy') || normalizedProduct.includes('cognac')) {
    basePrice = 50
  }
  
  // Ensure we generate at least 2 competitor prices for any search
  // This guarantees competitor data for the dashboard
  const minResults = 2;
  let resultsCount = 0;
  
  // Generate realistic competitor prices
  for (let i = 0; i < retailers.length; i++) {
    const retailer = retailers[i]
    
    // Each retailer has different pricing strategies
    let priceMultiplier = 1.0
    switch (retailer) {
      case 'Majestic Wine':
        priceMultiplier = 0.95 + Math.random() * 0.1 // Usually competitive
        break
      case 'Waitrose':
        priceMultiplier = 1.05 + Math.random() * 0.1 // Premium positioning
        break
      case 'Tesco':
        priceMultiplier = 0.9 + Math.random() * 0.15 // Value leader
        break
      case 'ASDA':
        priceMultiplier = 0.88 + Math.random() * 0.12 // Aggressive pricing
        break
      case 'Sainsbury\'s':
        priceMultiplier = 0.98 + Math.random() * 0.08 // Middle market
        break
    }
    
    const retailerPrice = basePrice * priceMultiplier
    const availability = Math.random() > 0.15 // 85% availability rate
    
    // Skip some retailers to simulate realistic availability
    // But ensure we get at least minResults
    if (resultsCount >= minResults && Math.random() < 0.2) continue 
    
    results.push({
      retailer,
      price: Math.round(retailerPrice * 100) / 100,
      availability,
      url: generateRetailerURL(retailer, product),
      product_name: formatProductName(product, retailer),
      relevance_score: 0.8 + Math.random() * 0.2
    })
    
    resultsCount++;
    
    // Simulate API rate limiting
    await new Promise(resolve => setTimeout(resolve, 20)) // Much faster for development
  }
  
  return results.sort((a, b) => a.price - b.price)
}

function generateRetailerURL(retailer: string, product: string): string {
  const baseURLs: { [key: string]: string } = {
    'Majestic Wine': 'https://majestic.co.uk/search',
    'Waitrose': 'https://waitrose.com/search',
    'Tesco': 'https://tesco.com/search',
    'ASDA': 'https://asda.com/search',
    'Sainsbury\'s': 'https://sainsburys.co.uk/search'
  }
  
  const baseURL = baseURLs[retailer] || 'https://example.com/search'
  return `${baseURL}?q=${encodeURIComponent(product)}`
}

function formatProductName(product: string, retailer: string): string {
  // Simulate how different retailers might format product names
  const variations: { [key: string]: (name: string) => string } = {
    'Majestic Wine': (name) => `${name} | Premium Selection`,
    'Waitrose': (name) => `${name} - Waitrose`,
    'Tesco': (name) => `${name} (Tesco)`,
    'ASDA': (name) => `${name} - ASDA`,
    'Sainsbury\'s': (name) => `${name} | Sainsbury's`
  }
  
  const formatter = variations[retailer] || ((name) => name)
  return formatter(product)
}
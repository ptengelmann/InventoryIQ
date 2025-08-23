// /src/lib/scrapers/mock-competitor-data.ts
// Market-intelligent competitor pricing using real alcohol industry knowledge

import { CompetitorPrice } from '@/types'
import { AlcoholMarketIntelligence } from '../alcohol-market-intelligence'
import { EnhancedMockDataGenerator } from '../enhanced-mock-data'

// UK alcohol retailers with realistic pricing patterns
const UK_RETAILERS = {
  majestic: { name: 'Majestic Wine', priceMultiplier: 1.05, availability: 0.85 },
  waitrose: { name: 'Waitrose', priceMultiplier: 1.15, availability: 0.95 },
  tesco: { name: 'Tesco', priceMultiplier: 0.88, availability: 0.90 },
  asda: { name: 'ASDA', priceMultiplier: 0.85, availability: 0.85 },
  morrisons: { name: 'Morrisons', priceMultiplier: 0.92, availability: 0.80 }
}

// Product categories with typical UK price ranges (updated with real market data)
const PRICE_RANGES = {
  beer: { min: 1.50, max: 8.00 },
  wine: { min: 6.00, max: 50.00 },
  spirits: { min: 18.00, max: 120.00 },
  gin: { min: 20.00, max: 60.00 },
  whisky: { min: 25.00, max: 200.00 },
  vodka: { min: 15.00, max: 80.00 },
  rtd: { min: 2.50, max: 12.00 },
  cider: { min: 2.00, max: 8.00 }
}

// Enhanced function that uses market intelligence
export async function getMockCompetitorPrices(
  productName: string,
  category: string = 'spirits',
  numRetailers: number = 3
): Promise<CompetitorPrice[]> {
  
  // First, try to use the enhanced market-intelligent generator
  try {
    const intelligentResults = await EnhancedMockDataGenerator.generateIntelligentCompetitorPrices(
      productName,
      category,
      Object.keys(UK_RETAILERS).slice(0, numRetailers)
    )
    
    if (intelligentResults.length > 0) {
      console.log(`Generated ${intelligentResults.length} market-intelligent prices for ${productName}`)
      return intelligentResults
    }
  } catch (error) {
    console.log('Falling back to basic competitor pricing due to:', error)
  }
  
  // Fallback to basic pricing if market intelligence fails
  return generateBasicCompetitorPrices(productName, category, numRetailers)
}

// Fallback basic pricing function
function generateBasicCompetitorPrices(
  productName: string,
  category: string,
  numRetailers: number
): CompetitorPrice[] {
  
  // Try to identify the product for better pricing
  const productMatch = AlcoholMarketIntelligence.findBestProductMatch(productName)
  let basePrice: number
  
  if (productMatch.brand && productMatch.confidence > 0.3) {
    // Use brand-based pricing
    basePrice = (productMatch.brand.typical_price_range.min + productMatch.brand.typical_price_range.max) / 2
    console.log(`Using brand pricing for ${productMatch.brand.name}: £${basePrice}`)
  } else {
    // Use category-based pricing
    const priceRange = PRICE_RANGES[category as keyof typeof PRICE_RANGES] || PRICE_RANGES.spirits
    basePrice = priceRange.min + Math.random() * (priceRange.max - priceRange.min)
  }
  
  // Select random retailers
  const retailerKeys = Object.keys(UK_RETAILERS)
  const selectedRetailers = retailerKeys
    .sort(() => 0.5 - Math.random())
    .slice(0, numRetailers)
  
  const results: CompetitorPrice[] = []
  
  for (const retailerId of selectedRetailers) {
    const retailer = UK_RETAILERS[retailerId as keyof typeof UK_RETAILERS]
    
    // Calculate realistic price with some variance
    const variance = 0.9 + Math.random() * 0.2 // ±10% variance
    const competitorPrice = Math.round((basePrice * retailer.priceMultiplier * variance) * 100) / 100
    
    // Simulate availability
    const isAvailable = Math.random() < retailer.availability
    
    results.push({
      sku: `${retailerId.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      competitor: retailer.name,
      competitor_price: competitorPrice,
      our_price: 0, // Will be set by caller
      price_difference: 0,
      price_difference_percentage: 0,
      availability: isAvailable,
      last_updated: new Date(),
      source: retailerId as any,
      product_name: generateProductName(productName, category, retailer.name),
      relevance_score: productMatch.confidence * 100 || 75 + Math.random() * 20,
      url: `https://${retailerId}.co.uk/search?q=${encodeURIComponent(productName)}`
    })
  }
  
  return results
}

function generateProductName(searchTerm: string, category: string, retailer: string): string {
  // Try to get brand information for better product names
  const productMatch = AlcoholMarketIntelligence.findBestProductMatch(searchTerm)
  
  if (productMatch.brand && productMatch.confidence > 0.5) {
    const variations = [
      `${productMatch.brand.name}`,
      `${productMatch.brand.name} - ${retailer} Selection`,
      `${productMatch.brand.name} ${productMatch.brand.volume_sizes[0]}ml`,
      `${productMatch.brand.parent_company} ${productMatch.brand.name}`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  }
  
  // Fallback to generic names
  const variations = [
    `${searchTerm} - ${retailer} Selection`,
    `${searchTerm} Premium`,
    `${searchTerm} - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    `${searchTerm} Classic`,
    `${searchTerm} - Special Reserve`
  ]
  
  return variations[Math.floor(Math.random() * variations.length)]
}

// Simulate delayed response like real API
export async function getMockCompetitorPricesWithDelay(
  productName: string,
  category: string = 'spirits',
  numRetailers: number = 3
): Promise<CompetitorPrice[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  return getMockCompetitorPrices(productName, category, numRetailers)
}

// Export enhanced version as well for direct use
export { EnhancedMockDataGenerator }
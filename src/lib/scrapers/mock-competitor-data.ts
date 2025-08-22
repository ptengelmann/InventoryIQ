// src/lib/scrapers/mock-competitor-data.ts
import { CompetitorPrice } from '@/types'

// UK alcohol retailers with realistic pricing patterns
const UK_RETAILERS = {
  majestic: { name: 'Majestic Wine', priceMultiplier: 0.95, availability: 0.85 },
  waitrose: { name: 'Waitrose', priceMultiplier: 1.15, availability: 0.95 },
  tesco: { name: 'Tesco', priceMultiplier: 0.88, availability: 0.90 },
  asda: { name: 'ASDA', priceMultiplier: 0.85, availability: 0.85 },
  morrisons: { name: 'Morrisons', priceMultiplier: 0.92, availability: 0.80 }
}

// Product categories with typical UK price ranges
const PRICE_RANGES = {
  beer: { min: 1.50, max: 8.00 },
  wine: { min: 6.00, max: 50.00 },
  spirits: { min: 18.00, max: 120.00 },
  rtd: { min: 2.50, max: 12.00 },
  cider: { min: 2.00, max: 8.00 }
}

export async function getMockCompetitorPrices(
  productName: string,
  category: string = 'spirits',
  numRetailers: number = 3
): Promise<CompetitorPrice[]> {
  
  // Determine base price range
  const priceRange = PRICE_RANGES[category as keyof typeof PRICE_RANGES] || PRICE_RANGES.spirits
  const basePrice = priceRange.min + Math.random() * (priceRange.max - priceRange.min)
  
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
      relevance_score: 75 + Math.random() * 20,
      url: `https://${retailerId}.co.uk/search?q=${encodeURIComponent(productName)}`
    })
  }
  
  return results
}

function generateProductName(searchTerm: string, category: string, retailer: string): string {
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
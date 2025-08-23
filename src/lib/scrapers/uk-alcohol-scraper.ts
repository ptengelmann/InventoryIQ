// src/lib/scrapers/uk-alcohol-scraper.ts
import { CompetitorPrice } from '@/types'
import { getMockCompetitorPricesWithDelay } from './mock-competitor-data'

// Main function that your app uses - uses your existing mock data system
export async function scrapeCompetitorPrices(
  productName: string,
  category: string,
  brand?: string,
  volume?: number
): Promise<CompetitorPrice[]> {
  console.log(`Getting competitive data for: ${productName} (${category})`)
  
  try {
    // Use your existing mock data system
    const results = await getMockCompetitorPricesWithDelay(productName, category, 4)
    
    // Add some product name variations to make matching more likely
    const enhancedResults = results.map(result => ({
      ...result,
      product_name: enhanceProductName(productName, result.product_name || '', brand),
      relevance_score: calculateRelevanceScore(productName, result.product_name || '', brand)
    }))
    
    console.log(`Found ${enhancedResults.length} competitor prices`)
    return enhancedResults
    
  } catch (error) {
    console.error('Error getting competitor data:', error)
    return []
  }
}

// Enhanced product name generation for better matching
function enhanceProductName(searchTerm: string, baseName: string, brand?: string): string {
  const variations = [
    searchTerm,
    brand ? `${brand} ${searchTerm}` : searchTerm,
    `${searchTerm} 70cl`,
    `${searchTerm} Premium`,
    baseName
  ]
  
  return variations[Math.floor(Math.random() * variations.length)]
}

// Calculate relevance score based on how well the result matches the search
function calculateRelevanceScore(searchTerm: string, productName: string, brand?: string): number {
  let score = 0.5 // Base score
  
  // Exact name match
  if (productName.toLowerCase().includes(searchTerm.toLowerCase())) {
    score += 0.3
  }
  
  // Brand match
  if (brand && productName.toLowerCase().includes(brand.toLowerCase())) {
    score += 0.2
  }
  
  // Random factor to simulate real-world variance
  score += Math.random() * 0.1
  
  return Math.min(1.0, Math.max(0.1, score))
}

// Export for potential future real scraping (currently unused)
export class UKAlcoholScraper {
  // Placeholder for future real scraping implementation
  static async searchProduct(productName: string, retailer: string, maxResults: number = 5) {
    return {
      success: false,
      error: "Real scraping not implemented yet - using mock data instead",
      data: null,
      rateLimited: false
    }
  }
  
  static async closeBrowser() {
    // Placeholder
    console.log("No browser to close - using mock data")
  }
}

// Create instance for backward compatibility
export const ukAlcoholScraper = UKAlcoholScraper
// scripts/test-scraper.ts
// Run with: npm run test-scraper

import { scrapeCompetitorPrices } from '../src/lib/scrapers/uk-alcohol-scraper'

async function testMockData() {
  console.log('Testing Mock Competitor Data System...\n')
  
  const testProducts = [
    { name: 'Hendricks Gin', category: 'spirits', brand: 'Hendricks' },
    { name: 'Châteauneuf du Pape', category: 'wine' },
    { name: 'Stella Artois', category: 'beer', brand: 'Stella Artois' },
    { name: 'Macallan 12', category: 'spirits', brand: 'Macallan' }
  ]
  
  for (const product of testProducts) {
    console.log(`\n--- Testing: ${product.name} (${product.category}) ---`)
    
    try {
      const results = await scrapeCompetitorPrices(
        product.name,
        product.category,
        product.brand
      )
      
      console.log(`Found ${results.length} competitor prices:`)
      
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.competitor}`)
        console.log(`     Product: ${result.product_name}`)
        console.log(`     Price: £${result.competitor_price}`)
        console.log(`     Available: ${result.availability ? 'Yes' : 'No'}`)
        console.log(`     Relevance: ${result.relevance_score?.toFixed(1) || 'N/A'}`)
        if (result.url) console.log(`     URL: ${result.url}`)
        console.log('')
      })
      
    } catch (error) {
      console.error(`Error testing ${product.name}:`, error)
    }
    
    // Small delay between tests
    console.log('Waiting 1 second...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n✅ Mock data test completed successfully!')
  console.log('\nNext steps:')
  console.log('1. Test the API endpoint: curl -X GET "http://localhost:3000/api/competitors/live?product=Hendricks%20Gin"')
  console.log('2. View the competitive dashboard at: http://localhost:3000/competitive')
  console.log('3. Consider building real integrations when you have beta customers')
}

// Run the test
if (require.main === module) {
  testMockData()
}
// src/lib/real-competitive-scraping.ts
// Fixed Puppeteer implementation for UK retailer scraping

import puppeteer, { Browser, Page } from 'puppeteer'
import { CompetitorPrice } from '@/types'

interface RetailerConfig {
  name: string
  searchUrl: string
  priceSelector: string
  productSelector: string
  availabilitySelector: string
  rateLimit: number
}

interface SelectorConfig {
  priceSelector: string
  productSelector: string
  availabilitySelector: string
}

// Real UK alcohol retailer configurations
const UK_RETAILERS: RetailerConfig[] = [
  {
    name: 'Majestic Wine',
    searchUrl: 'https://www.majestic.co.uk/search?q=',
    priceSelector: '.price, .product-price, [data-testid="price"], .price-value',
    productSelector: '.product-title, .product-name, h3, .product-card-title',
    availabilitySelector: '.availability, .stock-status, .product-availability',
    rateLimit: 3000
  },
  {
    name: 'Waitrose',
    searchUrl: 'https://www.waitrose.com/ecom/shop/search?searchTerm=',
    priceSelector: '.price__value, .productPrice, .current-price, .price',
    productSelector: '.productName, .product-title, .product-name',
    availabilitySelector: '.availability-message, .stock-info',
    rateLimit: 2500
  },
  {
    name: 'Tesco',
    searchUrl: 'https://www.tesco.com/groceries/en-GB/search?query=',
    priceSelector: '.price-per-unit, .value, .price-now, .price',
    productSelector: '.product-tile--title, .product-title, .product-name',
    availabilitySelector: '.product-info-message, .availability',
    rateLimit: 2000
  }
]

export class RealCompetitiveScraping {
  private static browser: Browser | null = null
  private static lastScrapeTime: { [retailer: string]: number } = {}

  static async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log('🚀 Launching Puppeteer browser...')
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        timeout: 30000
      })
      console.log('✅ Browser launched successfully')
    }
    return this.browser
  }

  // Core method: Replace your simulateCompetitorSearch with this
  static async scrapeRealCompetitorPrices(
    product: string,
    category: string,
    maxRetailers: number = 3
  ): Promise<CompetitorPrice[]> {
    console.log(`🔍 REAL SCRAPING: "${product}" in ${category}`)
    
    const results: CompetitorPrice[] = []
    
    try {
      const browser = await this.initBrowser()
      
      // Enhance search query using product intelligence
      const enhancedQuery = this.enhanceSearchQuery(product, category)
      console.log(`🔧 Enhanced query: "${enhancedQuery}"`)
      
      for (let i = 0; i < Math.min(UK_RETAILERS.length, maxRetailers); i++) {
        const retailer = UK_RETAILERS[i]
        
        try {
          // Respect rate limits
          await this.enforceRateLimit(retailer.name, retailer.rateLimit)
          
          const price = await this.scrapeRetailer(browser, retailer, enhancedQuery)
          if (price) {
            results.push(price)
            console.log(`✅ Found price at ${retailer.name}: £${price.competitor_price}`)
          } else {
            console.log(`ℹ️  No price found at ${retailer.name}`)
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`❌ Failed to scrape ${retailer.name}:`, errorMessage)
          // Continue with other retailers instead of failing completely
        }
      }
      
    } catch (browserError) {
      console.error('❌ Browser initialization failed:', browserError)
    }
    
    console.log(`🎯 Real scraping found ${results.length} actual competitor prices`)
    return results
  }

  private static async scrapeRetailer(
    browser: Browser,
    retailer: RetailerConfig,
    searchQuery: string
  ): Promise<CompetitorPrice | null> {
    let page: Page | null = null
    
    try {
      page = await browser.newPage()
      
      // Set realistic headers and viewport
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      await page.setViewport({ width: 1366, height: 768 })
      
      // Set extra headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      })
      
      const searchUrl = retailer.searchUrl + encodeURIComponent(searchQuery)
      console.log(`🔍 Searching ${retailer.name}: ${searchUrl}`)
      
      // Navigate with timeout
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      })
      
      // Wait for page to load properly - using correct Puppeteer API
      await this.delay(3000) // Replace waitForTimeout with delay
      
      // Try to find price and product info
      const productData = await page.evaluate((selectors: SelectorConfig) => {
        try {
          // Try multiple price selectors
          const priceSelectors = selectors.priceSelector.split(',').map(s => s.trim())
          let priceEl = null
          for (const selector of priceSelectors) {
            priceEl = document.querySelector(selector)
            if (priceEl) break
          }
          
          // Try multiple product selectors
          const productSelectors = selectors.productSelector.split(',').map(s => s.trim())
          let productEl = null
          for (const selector of productSelectors) {
            productEl = document.querySelector(selector)
            if (productEl) break
          }
          
          // Check availability
          const availabilitySelectors = selectors.availabilitySelector.split(',').map(s => s.trim())
          let availabilityEl = null
          for (const selector of availabilitySelectors) {
            availabilityEl = document.querySelector(selector)
            if (availabilityEl) break
          }
          
          if (!priceEl) {
            // Log what we found instead
            console.log('Available elements:', {
              priceElements: priceSelectors.map(sel => ({
                selector: sel,
                found: !!document.querySelector(sel),
                text: document.querySelector(sel)?.textContent?.slice(0, 50)
              })),
              bodyText: document.body.textContent?.slice(0, 200)
            })
            return null
          }
          
          const priceText = priceEl.textContent?.trim() || ''
          const productName = productEl?.textContent?.trim() || ''
          const availability = !availabilityEl?.textContent?.toLowerCase().includes('out of stock')
          
          return {
            price: priceText,
            productName,
            availability,
            url: window.location.href
          }
        } catch (error) {
          console.error('Error in page evaluation:', error)
          return null
        }
      }, {
        priceSelector: retailer.priceSelector,
        productSelector: retailer.productSelector,
        availabilitySelector: retailer.availabilitySelector
      })
      
      if (!productData) {
        console.log(`ℹ️  No product data found on ${retailer.name}`)
        return null
      }
      
      const price = this.parsePrice(productData.price)
      if (!price || price <= 0) {
        console.log(`ℹ️  Could not parse price "${productData.price}" from ${retailer.name}`)
        return null
      }
      
      return {
        sku: searchQuery.replace(/\s+/g, '-').toUpperCase(),
        competitor: retailer.name,
        competitor_price: price,
        our_price: 0, // Will be filled by calling function
        price_difference: 0,
        price_difference_percentage: 0,
        availability: productData.availability,
        last_updated: new Date(),
        source: 'real_scraping' as any,
        url: productData.url,
        product_name: productData.productName,
        relevance_score: this.calculateRelevance(searchQuery, productData.productName)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Error scraping ${retailer.name}:`, errorMessage)
      return null
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  private static parsePrice(priceText: string): number {
    if (!priceText) return 0
    
    console.log(`🔧 Parsing price: "${priceText}"`)
    
    // Handle various UK price formats
    const cleanPrice = priceText
      .replace(/[£$€]/g, '')
      .replace(/[^\d.,]/g, '')
      .replace(/,(\d{3})/g, '$1') // Remove thousands separator
    
    const price = parseFloat(cleanPrice)
    const result = isNaN(price) ? 0 : price
    
    console.log(`💰 Parsed price: ${result}`)
    return result
  }

  private static calculateRelevance(searchTerm: string, foundProduct: string): number {
    if (!foundProduct) return 0
    
    const searchWords = searchTerm.toLowerCase().split(/\s+/)
    const productWords = foundProduct.toLowerCase().split(/\s+/)
    
    let matches = 0
    for (const word of searchWords) {
      if (productWords.some(pw => pw.includes(word) || word.includes(pw))) {
        matches++
      }
    }
    
    return matches / searchWords.length
  }

  private static enhanceSearchQuery(product: string, category: string): string {
    // Simple enhancement without external dependencies
    let enhanced = product
      .replace(/\b(\d+)\s*ml\b/i, '$1ml')
      .replace(/\b(\d+)\s*cl\b/i, (match, p1) => `${parseInt(p1) * 10}ml`)
      .trim()
    
    // Add category-specific enhancements
    if (category === 'spirits' && !enhanced.toLowerCase().includes('gin') && !enhanced.toLowerCase().includes('whisky')) {
      enhanced += ` ${category}`
    }
    
    return enhanced
  }

  private static async enforceRateLimit(retailer: string, limitMs: number) {
    const lastScrape = this.lastScrapeTime[retailer] || 0
    const timeSince = Date.now() - lastScrape
    
    if (timeSince < limitMs) {
      const waitTime = limitMs - timeSince
      console.log(`⏱️  Rate limiting ${retailer}: waiting ${waitTime}ms`)
      await this.delay(waitTime)
    }
    
    this.lastScrapeTime[retailer] = Date.now()
  }

  // Simple delay function to replace waitForTimeout
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Cache results to reduce scraping frequency
  static async getCachedOrScrape(
    product: string, 
    category: string,
    cacheHours: number = 24
  ): Promise<CompetitorPrice[]> {
    // For now, always scrape fresh data for testing
    // Later you can implement cache checking against PostgreSQL
    console.log(`🔄 Scraping fresh data for ${product} (cache not implemented yet)`)
    
    const fresh = await this.scrapeRealCompetitorPrices(product, category, 2)
    
    return fresh
  }

  static async cleanup() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      console.log('🧹 Browser cleaned up')
    }
  }
}

// Enhanced search using Claude for product discovery
export async function enhanceSearchWithClaude(product: string): Promise<string> {
  // This would call Claude API to enhance the search
  // For now, return enhanced version based on patterns
  return product
    .replace(/\b(\d+)\s*ml\b/i, '$1ml')
    .replace(/\b(\d+)\s*cl\b/i, (match, p1) => `${parseInt(p1) * 10}ml`)
    .trim()
}
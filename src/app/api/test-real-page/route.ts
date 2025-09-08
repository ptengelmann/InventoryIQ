// Create /src/app/api/test-real-page/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET() {
  let browser = null
  let page = null
  
  try {
    console.log('🚀 Testing real page scraping...')
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
    
    // Test a simple search on Majestic Wine
    const testUrl = 'https://www.majestic.co.uk/search?q=Macallan'
    console.log(`🔍 Visiting: ${testUrl}`)
    
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 15000 })
    
    // Get page title and basic info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.textContent?.slice(0, 200),
        priceElements: Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent?.includes('£'))
          .slice(0, 5)
          .map(el => ({
            tagName: el.tagName,
            className: el.className,
            text: el.textContent?.slice(0, 50)
          })),
        productElements: Array.from(document.querySelectorAll('h1, h2, h3, h4, .product, .title'))
          .slice(0, 5)
          .map(el => ({
            tagName: el.tagName,
            className: el.className,
            text: el.textContent?.slice(0, 50)
          }))
      }
    })
    
    await browser.close()
    
    return NextResponse.json({
      success: true,
      page_info: pageInfo,
      test_url: testUrl
    })
    
  } catch (error) {
    if (browser) await browser.close()
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Could not access the test page - might be blocked or network issue'
    }, { status: 500 })
  }
}
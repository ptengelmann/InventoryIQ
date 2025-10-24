// Auto-scan API - Automatically scrape competitive prices for user's entire inventory
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, maxProducts = 20, background = false } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    console.log(`🤖 Starting auto-scan for user ${userId} (max ${maxProducts} products)`)

    // Get user's inventory using PostgreSQL service
    const allInventory = await PostgreSQLService.getUserSKUs(userId)

    if (!allInventory || allInventory.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No inventory found for user',
        message: 'Please upload inventory data first'
      })
    }

    // Sort by price (high to low) and take top N
    const inventory = allInventory
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, maxProducts)
      .map(item => ({
        sku_code: item.sku_code,
        product_name: item.product_name,
        price: item.price,
        category: item.category || 'alcohol',
        weekly_sales: item.weekly_sales || 0
      }))

    console.log(`📦 Found ${inventory.length} products to scan`)

    // Start background scanning
    if (background) {
      // Return immediately and scan in background
      scanInventoryInBackground(userId, inventory)

      return NextResponse.json({
        success: true,
        message: `Background scan started for ${inventory.length} products`,
        products_queued: inventory.length,
        estimated_time_minutes: Math.ceil(inventory.length * 0.5) // ~30 seconds per product
      })
    }

    // Synchronous scanning (for smaller batches)
    const results = await scanInventory(userId, inventory)

    return NextResponse.json({
      success: true,
      message: `Scanned ${results.scanned} products, found ${results.found} with competitor data`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Auto-scan error:', error)
    return NextResponse.json(
      {
        error: 'Failed to start auto-scan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function scanInventory(userId: string, inventory: any[]) {
  let scanned = 0
  let found = 0
  let errors = 0

  for (const product of inventory) {
    try {
      // Call the live competitor API
      const searchTerm = product.product_name || product.sku_code
      const queryParams = new URLSearchParams({
        product: searchTerm,
        category: product.category || 'alcohol',
        maxRetailers: '8',
        userId,
        userEmail: userId
      })

      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/competitors/live?${queryParams.toString()}`

      console.log(`🔍 Scanning ${product.sku_code}: ${searchTerm}`)

      const response = await fetch(apiUrl)
      const data = await response.json()

      scanned++

      if (data.success && data.competitors && data.competitors.length > 0) {
        found++
        console.log(`✅ Found ${data.competitors.length} competitors for ${product.sku_code}`)
      } else {
        console.log(`⚠️ No competitors found for ${product.sku_code}`)
      }

      // Rate limiting - 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      errors++
      console.error(`❌ Error scanning ${product.sku_code}:`, error)
    }
  }

  return {
    scanned,
    found,
    errors,
    total: inventory.length
  }
}

async function scanInventoryInBackground(userId: string, inventory: any[]) {
  // This runs asynchronously without blocking the response
  setTimeout(async () => {
    console.log(`🚀 Background scan started for ${inventory.length} products`)
    const results = await scanInventory(userId, inventory)
    console.log(`✅ Background scan completed:`, results)
  }, 100)
}

// GET endpoint to check scan status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      )
    }

    // Check how many products have competitive data
    const totalInventory = await PostgreSQLService.getUserSKUs(userId)
    const competitorData = await PostgreSQLService.getCompetitorData(userId, 30)

    // Get unique SKUs with competitor data
    const uniqueSKUs = new Set(competitorData.map(item => item.sku))

    const coverage = totalInventory.length > 0
      ? Math.round((uniqueSKUs.size / totalInventory.length) * 100)
      : 0

    return NextResponse.json({
      success: true,
      total_inventory: totalInventory.length,
      products_with_data: uniqueSKUs.size,
      coverage_percentage: coverage,
      needs_scan: coverage < 50
    })

  } catch (error) {
    console.error('Error checking scan status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check scan status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

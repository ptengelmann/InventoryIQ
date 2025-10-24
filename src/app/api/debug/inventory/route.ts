// Debug endpoint to check inventory product names
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId') || 'pedro@inventoryiq.com'
    const limit = parseInt(searchParams.get('limit') || '10')

    const inventory = await PostgreSQLService.getUserSKUs(userId)

    // Sort by price (high to low) and take top N
    const topProducts = inventory
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, limit)
      .map(item => ({
        sku_code: item.sku_code,
        product_name: item.product_name,
        price: item.price,
        category: item.category || 'alcohol'
      }))

    return NextResponse.json({
      success: true,
      total_inventory: inventory.length,
      showing: topProducts.length,
      products: topProducts
    })

  } catch (error) {
    console.error('Debug inventory error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

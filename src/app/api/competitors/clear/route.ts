// API to clear old competitor data and force re-scrape
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, confirmClear } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    if (!confirmClear) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Please confirm that you want to clear all competitor data by setting confirmClear: true'
        },
        { status: 400 }
      )
    }

    console.log(`🗑️ Clearing all competitor data for user ${userId}...`)

    // Delete all competitor prices for this user
    const deleteResult = await prisma.competitorPrice.deleteMany({
      where: {
        user_id: userId
      }
    })

    console.log(`✅ Deleted ${deleteResult.count} competitor price records`)

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${deleteResult.count} competitor price records`,
      deleted_count: deleteResult.count,
      timestamp: new Date().toISOString(),
      next_steps: [
        'Old inaccurate data has been removed',
        'Visit /competitive page to trigger fresh scraping',
        'New scrapes will use enhanced accuracy algorithms',
        'Only alcohol products with >50% match quality will be included'
      ]
    })

  } catch (error) {
    console.error('Error clearing competitor data:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear competitor data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check how much data would be cleared
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

    // Count existing competitor prices
    const count = await prisma.competitorPrice.count({
      where: {
        user_id: userId
      }
    })

    // Get sample of existing data to show what will be cleared
    const samples = await prisma.competitorPrice.findMany({
      where: {
        user_id: userId
      },
      take: 5,
      select: {
        sku_code: true,
        competitor: true,
        competitor_price: true,
        relevance_score: true,
        product_name: true,
        last_updated: true
      },
      orderBy: {
        last_updated: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      total_records: count,
      message: `Found ${count} competitor price records that would be cleared`,
      sample_data: samples,
      warning: 'This action cannot be undone. All competitor pricing data will be permanently deleted.'
    })

  } catch (error) {
    console.error('Error checking competitor data:', error)
    return NextResponse.json(
      {
        error: 'Failed to check competitor data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

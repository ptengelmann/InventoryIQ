import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockStats = {
      totalAnalyses: Math.floor(Math.random() * 10) + 1,
      totalSKUs: Math.floor(Math.random() * 200) + 50,
      totalRevenuePotential: Math.floor(Math.random() * 50000) + 5000,
      avgSKUsPerAnalysis: Math.floor(Math.random() * 40) + 20,
      recentAnalyses: Math.floor(Math.random() * 5) + 1
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
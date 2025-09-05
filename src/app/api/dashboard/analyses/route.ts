import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockAnalyses = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
      _id: `analysis-${i + 1}`,
      uploadId: `upload-${Date.now()}-${i}`,
      fileName: `inventory_export_${i + 1}.csv`,
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      summary: {
        totalSKUs: Math.floor(Math.random() * 100) + 20,
        totalRevenuePotential: Math.floor(Math.random() * 15000) + 1000,
        priceIncreases: Math.floor(Math.random() * 20) + 5,
        priceDecreases: Math.floor(Math.random() * 15) + 2
      }
    }))

    return NextResponse.json({
      success: true,
      analyses: mockAnalyses,
      count: mockAnalyses.length
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
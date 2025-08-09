import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

// GET /api/alerts/latest - Get alerts from most recent analysis
export async function GET(request: NextRequest) {
  try {
    const alerts = await DatabaseService.getLatestAlerts()
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      source: 'latest_analysis'
    })
  } catch (error) {
    console.error('Error fetching latest alerts:', error)
    return NextResponse.json({
      error: 'Failed to fetch latest alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
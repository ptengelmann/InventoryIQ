// =================================================================
// FILE 4: /src/app/api/alerts/stats/route.ts - Alert Statistics
// =================================================================

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching alert statistics...')
    
    const stats = await DatabaseService.getAlertStatistics()
    
    console.log('Alert statistics:', stats)
    
    return NextResponse.json({
      success: true,
      ...stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Alert stats API error:', error)
    
    // Return fallback stats
    return NextResponse.json({
      success: false,
      totalAlerts: 0,
      criticalAlerts: 0,
      unreadAlerts: 0,
      resolvedAlerts: 0,
      acknowledgementRate: 0,
      resolutionRate: 0,
      error: 'Database unavailable',
      timestamp: new Date().toISOString()
    })
  }
}
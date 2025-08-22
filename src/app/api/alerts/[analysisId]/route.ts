// =================================================================
// FILE 3: /src/app/api/alerts/[analysisId]/route.ts - Analysis-Specific Alerts
// =================================================================

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysisId = params.analysisId
    console.log(`Fetching alerts for analysis: ${analysisId}`)
    
    const alerts = await DatabaseService.getAlertsForAnalysis(analysisId)
    
    console.log(`Found ${alerts.length} alerts for analysis ${analysisId}`)
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      analysisId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Analysis alerts API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch alerts for analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysisId = params.analysisId
    const { alertId, action } = await request.json()
    
    console.log(`Updating alert ${alertId} in analysis ${analysisId}: ${action}`)
    
    const success = await DatabaseService.updateAlertStatus(analysisId, alertId, action)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Alert ${action}d successfully`,
        analysisId,
        alertId,
        action
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to update alert status'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Alert update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysisId = params.analysisId
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')
    
    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }
    
    console.log(`Deleting alert ${alertId} from analysis ${analysisId}`)
    
    const success = await DatabaseService.deleteAlert(analysisId, alertId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Alert deleted successfully',
        analysisId,
        alertId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete alert'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Alert deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

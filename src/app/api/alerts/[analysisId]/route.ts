// UPDATE EXISTING FILE: /api/alerts/[analysisId]/route.ts
// Enhanced Alert API with full CRUD operations

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

// GET /api/alerts/[analysisId] - Get alerts for specific analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const alerts = await DatabaseService.getAlertsForAnalysis(params.analysisId)
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({
      error: 'Failed to fetch alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/alerts/[analysisId] - Update alert status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { alertId, action } = await request.json()
    
    if (!alertId || !action) {
      return NextResponse.json({
        error: 'Missing required fields: alertId and action'
      }, { status: 400 })
    }

    if (!['acknowledge', 'resolve', 'snooze'].includes(action)) {
      return NextResponse.json({
        error: 'Invalid action. Must be "acknowledge", "resolve", or "snooze"'
      }, { status: 400 })
    }

    const success = await DatabaseService.updateAlertStatus(
      params.analysisId,
      alertId,
      action === 'acknowledge' ? 'acknowledged' : 
      action === 'resolve' ? 'resolved' : 'snoozed'
    )

    if (!success) {
      return NextResponse.json({
        error: 'Failed to update alert status'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({
      error: 'Failed to update alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/alerts/[analysisId] - Delete specific alert or all alerts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')
    const deleteAll = searchParams.get('deleteAll') === 'true'
    
    if (deleteAll) {
      // Delete all alerts for this analysis
      const success = await DatabaseService.deleteAllAlertsForAnalysis(params.analysisId)
      
      if (!success) {
        return NextResponse.json({
          error: 'Failed to delete alerts'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'All alerts deleted successfully'
      })
    } else if (alertId) {
      // Delete specific alert
      const success = await DatabaseService.deleteAlert(params.analysisId, alertId)
      
      if (!success) {
        return NextResponse.json({
          error: 'Failed to delete alert'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'Alert deleted successfully'
      })
    } else {
      return NextResponse.json({
        error: 'Must provide either alertId or deleteAll=true'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({
      error: 'Failed to delete alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/alerts/[analysisId] - Batch operations on alerts
export async function POST(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { operation, alertIds } = await request.json()
    
    if (!operation || !alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json({
        error: 'Missing required fields: operation and alertIds array'
      }, { status: 400 })
    }

    if (!['acknowledge_all', 'resolve_all', 'delete_selected'].includes(operation)) {
      return NextResponse.json({
        error: 'Invalid operation. Must be "acknowledge_all", "resolve_all", or "delete_selected"'
      }, { status: 400 })
    }

    const results = []
    
    for (const alertId of alertIds) {
      try {
        let success = false
        
        if (operation === 'delete_selected') {
          success = await DatabaseService.deleteAlert(params.analysisId, alertId)
        } else {
          const status = operation === 'acknowledge_all' ? 'acknowledged' : 'resolved'
          success = await DatabaseService.updateAlertStatus(params.analysisId, alertId, status)
        }
        
        results.push({ alertId, success })
      } catch (error) {
        results.push({ alertId, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      message: `${operation} completed: ${successCount}/${alertIds.length} alerts processed`,
      results
    })
  } catch (error) {
    console.error('Error in batch operation:', error)
    return NextResponse.json({
      error: 'Failed to perform batch operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
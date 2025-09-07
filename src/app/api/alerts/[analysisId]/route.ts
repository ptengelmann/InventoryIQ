// src/app/api/alerts/[analysisId]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 })
    }
    
    const userIdentifier = userId || userEmail || ''
    const analysisId = params.analysisId
    
    console.log(`🔍 Getting alerts for analysis ${analysisId}, user: ${userIdentifier}`)
    
    // FIXED: Get alerts directly from database with proper analysis filtering
    const user = await PostgreSQLService.getUserByEmail(userIdentifier)
    
    if (!user) {
      console.log('User not found:', userIdentifier)
      return NextResponse.json({
        success: true,
        alerts: [],
        count: 0,
        analysisId,
        timestamp: new Date().toISOString()
      })
    }
    
    // Get alerts specifically for this analysis
    const alerts = await PostgreSQLService.getAlertsForAnalysisId(user.id, analysisId)
    
    console.log(`📊 Found ${alerts.length} alerts for analysis ${analysisId}`)
    
    // Convert to proper Alert format
   const formattedAlerts = alerts.map((alert: any) => ({
  id: alert.id,
  rule_id: `rule-${alert.type}`,
  sku: alert.sku_code || 'unknown',
  category: alert.sku?.category || alert.type,
  type: alert.type,
  severity: alert.severity,
  title: alert.title,
  message: alert.message,
  action_required: generateActionFromType(alert.type),
  impact: {
    revenue_at_risk: alert.revenue_at_risk || 0,
    profit_opportunity: alert.profit_opportunity || 0,
    time_to_critical: alert.time_to_critical || 0,
    urgency: alert.urgency_score || 5  // Map urgency_score to urgency
  },
  data: {
    current_stock: alert.sku?.inventory_level || 0,
    predicted_demand: alert.sku?.weekly_sales ? alert.sku.weekly_sales * 4 : 0,
    weeks_of_stock: alert.sku?.inventory_level && alert.sku?.weekly_sales ? 
      alert.sku.inventory_level / alert.sku.weekly_sales : 0,
    confidence: 0.8,
    trend: 'stable'
  },
  alcohol_context: {
    abv: alert.sku?.abv,
    shelf_life_days: alert.sku?.shelf_life_days || 365,
    seasonal_peak: getSeasonalPeak(alert.sku?.category || 'spirits'),
    compliance_notes: getComplianceNotes(alert.sku),
    category_risk: 'moderate'
  },
  created_at: new Date(alert.created_at),  // Convert to Date object
  acknowledged: alert.acknowledged,
  resolved: alert.resolved,
  delivered_via: ['dashboard'],
  metadata: {
    source: 'database',
    analysis_id: analysisId,
    confidence_score: 0.8,
    auto_generated: true
  }
}))
    
    return NextResponse.json({
      success: true,
      alerts: formattedAlerts,
      count: formattedAlerts.length,
      analysisId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Analysis alerts API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analysis alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const body = await request.json()
    const { alertId, action, userId } = body
    
    if (!alertId || !action || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: alertId, action, userId' 
      }, { status: 400 })
    }
    
    if (!['acknowledge', 'resolve', 'snooze'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be: acknowledge, resolve, or snooze' 
      }, { status: 400 })
    }
    
    console.log(`🔄 Updating alert ${alertId} to ${action} for user ${userId}`)
    
    const success = await PostgreSQLService.updateAlertStatus(
      alertId,
      action as 'acknowledged' | 'resolved' | 'snoozed',
      userId
    )
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Alert ${action}d successfully`,
        alertId,
        action,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to update alert status' 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Alert update API error:', error)
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
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')
    const userId = searchParams.get('userId')
    
    if (!alertId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required parameters: alertId, userId' 
      }, { status: 400 })
    }
    
    console.log(`🗑️ Deleting alert ${alertId} for user ${userId}`)
    
    const success = await PostgreSQLService.deleteAlert(alertId, userId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Alert deleted successfully',
        alertId,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to delete alert' 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Alert delete API error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function generateActionFromType(type: string): string {
  const actionMap: Record<string, string> = {
    'stockout': 'REORDER INVENTORY IMMEDIATELY',
    'overstock': 'IMPLEMENT PROMOTIONAL PRICING',
    'price_opportunity': 'ADJUST PRICING STRATEGY',
    'seasonal_prep': 'PREPARE FOR SEASONAL DEMAND',
    'competitor_threat': 'REVIEW COMPETITIVE POSITION',
    'compliance': 'REVIEW COMPLIANCE REQUIREMENTS',
    'expiration_risk': 'IMPLEMENT CLEARANCE STRATEGY'
  }
  
  return actionMap[type] || 'REVIEW AND TAKE ACTION'
}

function getSeasonalPeak(category: string): string {
  const peaks: Record<string, string> = {
    beer: 'Summer months (May-August)',
    wine: 'Holiday season (Oct-Jan)',
    spirits: 'Holiday season (Nov-Jan)',
    rtd: 'Summer season (Apr-Sep)',
    cider: 'Autumn months (Sep-Nov)'
  }
  return peaks[category] || 'Year-round demand'
}

function getComplianceNotes(sku: any): string[] {
  if (!sku) return ['Standard alcohol retail compliance']
  
  const notes: string[] = []
  
  if (sku.abv && sku.abv > 40) {
    notes.push(`High-proof spirits (${sku.abv}% ABV): Additional tax requirements`)
  }
  
  if (sku.origin_country && sku.origin_country !== 'UK') {
    notes.push(`Imported product: Import duties apply`)
  }
  
  if (notes.length === 0) {
    notes.push('Standard alcohol retail compliance')
  }
  
  return notes
}
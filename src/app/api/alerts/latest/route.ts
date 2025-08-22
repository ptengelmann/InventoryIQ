// =================================================================
// FILE 2: /src/app/api/alerts/latest/route.ts - Fixed Import Issues
// =================================================================

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { Alert } from '@/lib/alert-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    
    console.log('Fetching latest alerts...')
    
    const alerts = await DatabaseService.getLatestAlerts(userId)
    
    console.log(`Found ${alerts.length} latest alerts`)
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Latest alerts API error:', error)
    
    // Return fallback demo alerts if database fails
    const fallbackAlerts = [
      {
        id: 'demo-alert-1',
        rule_id: 'critical-stockout',
        sku: 'WHISKEY-DEMO-001',
        category: 'spirits',
        type: 'stockout',
        severity: 'critical',
        title: 'DEMO: Critical Stockout Alert',
        message: 'This is demo data. Upload a CSV file to see real alerts.',
        action_required: 'Upload your inventory data for real alerts',
        impact: { revenue_at_risk: 0 },
        data: { 
          current_stock: 0, 
          predicted_demand: 0, 
          weeks_of_stock: 0, 
          confidence: 0.5, 
          trend: 'stable' 
        },
        created_at: new Date(),
        acknowledged: false,
        resolved: false,
        delivered_via: []
      }
    ]
    
    return NextResponse.json({
      success: false,
      alerts: fallbackAlerts,
      count: fallbackAlerts.length,
      error: 'Database unavailable - showing demo data',
      timestamp: new Date().toISOString()
    })
  }
}

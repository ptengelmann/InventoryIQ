// src/app/api/alerts/latest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const limit = parseInt(searchParams.get('limit') || '10')
    const severity = searchParams.get('severity') // 'critical', 'high', 'medium', 'low'
    const status = searchParams.get('status') // 'unread', 'acknowledged', 'resolved'
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 })
    }
    
    const userIdentifier = userId || userEmail || ''
    console.log(`Getting latest alerts for user: ${userIdentifier}, limit: ${limit}`)
    
    // Build query filters
    const filters = {
      userId: userIdentifier,
      limit,
      severity,
      status
    }
    
    const alerts = await PostgreSQLService.getLatestAlerts(userIdentifier, limit)

    // Enrich alerts with calculated metrics AND fix old alerts with £0 values
    const enrichedAlerts = alerts.map(alert => {
      const enriched = {
        ...alert,
        urgency_score: calculateUrgencyScore(alert),
        time_since_created: Date.now() - new Date(alert.created_at).getTime(),
        requires_immediate_action: alert.severity === 'critical' && !alert.acknowledged
      }

      // FIX OLD ALERTS: Calculate real revenue values if they're £0
      if (enriched.revenue_at_risk === 0 || !enriched.revenue_at_risk) {
        const calculated = calculateRevenueFromMessage(alert.message, alert.type, alert.severity)
        enriched.revenue_at_risk = calculated.revenue_at_risk
        enriched.estimated_impact = calculated.estimated_impact
        enriched.cost_to_resolve = calculated.cost_to_resolve
      }

      return enriched
    })
    
    // Sort by urgency and creation time
    enrichedAlerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        const severityOrder: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
        return (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    return NextResponse.json({
      success: true,
      alerts: enrichedAlerts,
      count: enrichedAlerts.length,
      filters_applied: filters,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Latest alerts API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch latest alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, alert_type, message, severity, metadata } = body
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 })
    }
    
    if (!alert_type || !message || !severity) {
      return NextResponse.json({ 
        error: 'Missing required fields: alert_type, message, severity' 
      }, { status: 400 })
    }
    
    const userIdentifier = userId || userEmail || ''
    console.log(`Creating new alert for user: ${userIdentifier}`)
    
    const newAlert = {
      user_id: userIdentifier,
      alert_type,
      message,
      severity,
      status: 'unread',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // TODO: Implement createAlert method in PostgreSQLService
    console.log('Alert creation requested:', newAlert)
    
    return NextResponse.json({
      success: true,
      alert_id: `temp-${Date.now()}`,
      message: 'Alert creation logged (implementation pending)',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Create alert API error:', error)
    return NextResponse.json({
      error: 'Failed to create alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Calculate real revenue values from alert message (for old generic alerts)
function calculateRevenueFromMessage(message: string, type: string, severity: string): {
  revenue_at_risk: number
  estimated_impact: number
  cost_to_resolve: number
} {
  // Extract weeks of stock from message
  const weeksMatch = message.match(/(\d+\.?\d*)\s*weeks/i)
  const weeksOfStock = weeksMatch ? parseFloat(weeksMatch[1]) : 10

  // Extract demand prediction if available
  const demandMatch = message.match(/predicts?\s+(\d+)\s+units/i)
  const weeklyDemand = demandMatch ? parseInt(demandMatch[1]) : 10

  // Estimate price (£25 avg for alcohol)
  const estimatedPrice = 25

  if (type === 'overstock') {
    // For overstock: calculate cash tied up and holding costs
    const excessWeeks = Math.max(0, weeksOfStock - 12) // Anything over 12 weeks is excess
    const excessUnits = Math.floor(excessWeeks * weeklyDemand)
    const cashTiedUp = excessUnits * estimatedPrice * 0.7 // 70% of retail is cost
    const holdingCostPerMonth = cashTiedUp * 0.02 // 2% monthly holding cost
    const monthsToSell = excessWeeks / 4

    return {
      revenue_at_risk: Math.floor(holdingCostPerMonth * monthsToSell), // Lost to holding costs
      estimated_impact: Math.floor(cashTiedUp * 0.15), // 15% discount to clear = profit impact
      cost_to_resolve: Math.floor(cashTiedUp * 0.15) // Discount needed
    }
  } else if (type === 'stockout') {
    // For stockout: calculate lost revenue
    const weeksOut = Math.max(1, 4 - weeksOfStock) // How many weeks we'll be out of stock
    const lostSales = weeksOut * weeklyDemand
    const lostRevenue = lostSales * estimatedPrice
    const reorderCost = weeklyDemand * 8 * estimatedPrice * 0.6 // 8 weeks supply at cost

    return {
      revenue_at_risk: Math.floor(lostRevenue),
      estimated_impact: Math.floor(lostRevenue * 0.3), // 30% margin
      cost_to_resolve: Math.floor(reorderCost)
    }
  }

  // Default for other types
  const baseRevenue = weeklyDemand * estimatedPrice * 4
  return {
    revenue_at_risk: Math.floor(baseRevenue * 0.5),
    estimated_impact: Math.floor(baseRevenue * 0.15),
    cost_to_resolve: Math.floor(baseRevenue * 0.3)
  }
}

// Utility function to calculate urgency score
function calculateUrgencyScore(alert: any): number {
  const severityWeights: Record<string, number> = { 'critical': 1.0, 'high': 0.75, 'medium': 0.5, 'low': 0.25 }
  const baseUrgency = severityWeights[alert.severity] || 0.25

  // Factor in time since creation (older alerts become more urgent)
  const hoursOld = (Date.now() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60)
  const timeMultiplier = Math.min(1.5, 1 + (hoursOld / 24) * 0.1) // Max 1.5x after 5 days

  // Factor in financial impact if available
  const financialImpact = alert.impact?.revenue_at_risk || alert.revenue_at_risk || 0
  const financialMultiplier = financialImpact > 1000 ? 1.2 : 1.0

  return Math.min(1.0, baseUrgency * timeMultiplier * financialMultiplier)
}
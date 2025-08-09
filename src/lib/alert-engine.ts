// COMPLETE REPLACEMENT: /lib/alert-engine.ts
// Smart Alert Engine for InventoryIQ with Fixed Unique IDs

import { AIEngine } from './ai-engine'

export interface AlertRule {
  id: string
  name: string
  type: 'stockout' | 'overstock' | 'price_opportunity' | 'demand_spike' | 'trend_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  conditions: {
    weeks_of_stock_below?: number
    weeks_of_stock_above?: number
    confidence_threshold?: number
    revenue_opportunity_above?: number
    demand_change_percentage?: number
  }
  delivery_methods: ('email' | 'sms' | 'push' | 'slack')[]
  enabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  last_triggered?: Date
}

export interface Alert {
  id: string
  rule_id: string
  sku: string
  type: AlertRule['type']
  severity: AlertRule['severity']
  title: string
  message: string
  action_required: string
  impact: {
    revenue_at_risk?: number
    profit_opportunity?: number
    time_to_critical?: number // days
  }
  data: {
    current_stock: number
    predicted_demand: number
    weeks_of_stock: number
    confidence: number
    trend: string
  }
  created_at: Date
  acknowledged: boolean
  resolved: boolean
  delivered_via: string[]
}

export class AlertEngine {
  // Counter to ensure unique IDs
  private static alertCounter = 0

  // Generate truly unique alert ID
  private static generateUniqueId(sku: string, ruleType: string): string {
    const timestamp = Date.now()
    const counter = ++AlertEngine.alertCounter
    const random = Math.random().toString(36).substr(2, 8)
    return `alert-${timestamp}-${counter}-${sku}-${ruleType}-${random}`
  }
  
// Default alert rules for new users
static getDefaultAlertRules(): AlertRule[] {
  return [
    {
      id: 'critical-stockout',
      name: 'Critical Stockout Warning',
      type: 'stockout',
      severity: 'critical',
      conditions: {
        weeks_of_stock_below: 2,
        confidence_threshold: 0.5
      },
      delivery_methods: ['email', 'push'],
      enabled: true,
      frequency: 'immediate'
    },
    {
      id: 'stockout-warning',
      name: 'Low Stock Alert',
      type: 'stockout',
      severity: 'high',
      conditions: {
        weeks_of_stock_below: 4,
        confidence_threshold: 0.4
      },
      delivery_methods: ['email'],
      enabled: true,
      frequency: 'daily'
    },
    {
      id: 'overstock-alert',
      name: 'Overstock Detection',
      type: 'overstock',
      severity: 'medium',
      conditions: {
        weeks_of_stock_above: 10,
        confidence_threshold: 0.5
      },
      delivery_methods: ['email'],
      enabled: true,
      frequency: 'weekly'
    },
    {
      id: 'price-opportunity',
      name: 'Revenue Opportunity',
      type: 'price_opportunity',
      severity: 'medium',
      conditions: {
        revenue_opportunity_above: 50,
        confidence_threshold: 0.6
      },
      delivery_methods: ['email'],
      enabled: true,
      frequency: 'daily'
    },
    {
      id: 'demand-spike',
      name: 'Demand Spike Detection',
      type: 'demand_spike',
      severity: 'high',
      conditions: {
        demand_change_percentage: 30,
        confidence_threshold: 0.6
      },
      delivery_methods: ['email', 'push'],
      enabled: true,
      frequency: 'immediate'
    }
  ]
}

  // Analyze inventory data and generate alerts
  static analyzeAndGenerateAlerts(
    inventoryData: Array<{
      sku: string
      currentPrice: number
      currentInventory: number
      weeklySales: number
    }>,
    alertRules: AlertRule[]
  ): Alert[] {
    
    const alerts: Alert[] = []
    
    // Use AI to analyze each SKU
    const aiResult = AIEngine.analyzeBatch(inventoryData)
    
    for (const result of aiResult.batch_results) {
      const { sku, current_metrics, forecast } = result
      const weeksOfStock = current_metrics.inventory / (current_metrics.weekly_sales || 0.1)
      
      // Check each alert rule
      for (const rule of alertRules.filter(r => r.enabled)) {
        const alert = this.checkRule(rule, {
          sku,
          currentPrice: current_metrics.price,
          currentInventory: current_metrics.inventory,
          weeklySales: current_metrics.weekly_sales,
          forecast,
          weeksOfStock
        })
        
        if (alert) {
          alerts.push(alert)
        }
      }
    }
    
    // Sort by severity and impact
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  // Check if a specific rule is triggered
  private static checkRule(
    rule: AlertRule,
    data: {
      sku: string
      currentPrice: number
      currentInventory: number
      weeklySales: number
      forecast: any
      weeksOfStock: number
    }
  ): Alert | null {
    
    const { sku, currentPrice, currentInventory, weeklySales, forecast, weeksOfStock } = data
    const confidence = forecast.confidence_interval.confidence_level
    
    // Check if confidence meets threshold
    if (rule.conditions.confidence_threshold && confidence < rule.conditions.confidence_threshold) {
      return null
    }
    
    let triggered = false
    let alertData: Partial<Alert> = {}
    
    switch (rule.type) {
      case 'stockout':
        if (rule.conditions.weeks_of_stock_below && weeksOfStock < rule.conditions.weeks_of_stock_below) {
          triggered = true
          const daysToStockout = weeksOfStock * 7
          alertData = {
            title: `${rule.severity.toUpperCase()}: ${sku} Stock Critical`,
            message: `Only ${weeksOfStock.toFixed(1)} weeks of stock remaining for ${sku}. AI predicts stockout in ${daysToStockout.toFixed(0)} days with ${Math.round(confidence * 100)}% confidence.`,
            action_required: daysToStockout < 7 ? 'URGENT: Reorder immediately' : 'Schedule reorder within 48 hours',
            impact: {
              revenue_at_risk: weeklySales * currentPrice * 4, // 4 weeks of lost sales
              time_to_critical: daysToStockout
            }
          }
        }
        break
        
      case 'overstock':
        if (rule.conditions.weeks_of_stock_above && weeksOfStock > rule.conditions.weeks_of_stock_above) {
          triggered = true
          const excessWeeks = weeksOfStock - 8 // Optimal is ~8 weeks
          alertData = {
            title: `Overstock Alert: ${sku}`,
            message: `${sku} has ${weeksOfStock.toFixed(1)} weeks of excess inventory. Consider promotional pricing to move ${Math.round(excessWeeks * weeklySales)} units.`,
            action_required: 'Create promotion or adjust pricing strategy',
            impact: {
              profit_opportunity: excessWeeks * weeklySales * currentPrice * 0.1 // 10% margin improvement
            }
          }
        }
        break
        
      case 'price_opportunity':
        const revenueOpportunity = forecast.recommendation.expected_impact.revenue_change
        if (rule.conditions.revenue_opportunity_above && revenueOpportunity > rule.conditions.revenue_opportunity_above) {
          triggered = true
          alertData = {
            title: `Revenue Opportunity: ${sku}`,
            message: `AI identified $${revenueOpportunity} monthly revenue opportunity for ${sku}. ${forecast.recommendation.action.replace('_', ' ')} recommended with ${Math.round(confidence * 100)}% confidence.`,
            action_required: `${forecast.recommendation.action.replace('_', ' ').toUpperCase()} - ${this.getActionDetails(forecast.recommendation.action, currentPrice)}`,
            impact: {
              profit_opportunity: revenueOpportunity
            }
          }
        }
        break
        
      case 'demand_spike':
        if (forecast.trend === 'increasing') {
          const demandIncrease = (forecast.predicted_demand - weeklySales) / weeklySales * 100
          if (rule.conditions.demand_change_percentage && demandIncrease > rule.conditions.demand_change_percentage) {
            triggered = true
            alertData = {
              title: `Demand Surge Detected: ${sku}`,
              message: `AI predicts ${demandIncrease.toFixed(0)}% demand increase for ${sku}. Current inventory may be insufficient for surge.`,
              action_required: 'Increase inventory and consider price optimization',
              impact: {
                revenue_at_risk: demandIncrease * currentPrice * weeklySales / 100,
                time_to_critical: weeksOfStock * 7 / (1 + demandIncrease / 100)
              }
            }
          }
        }
        break
        
      case 'trend_change':
        if (forecast.trend !== 'stable') {
          triggered = true
          alertData = {
            title: `Trend Change: ${sku}`,
            message: `${sku} showing ${forecast.trend} trend with ${Math.round(confidence * 100)}% confidence. Review pricing strategy.`,
            action_required: forecast.trend === 'increasing' ? 'Consider price increase' : 'Review pricing and promotion strategy',
            impact: {
              profit_opportunity: Math.abs(forecast.recommendation.expected_impact.revenue_change)
            }
          }
        }
        break
    }
    
    if (!triggered) return null
    
    // Use the new unique ID generator
    return {
      id: AlertEngine.generateUniqueId(sku, rule.type),
      rule_id: rule.id,
      sku,
      type: rule.type,
      severity: rule.severity,
      title: alertData.title || '',
      message: alertData.message || '',
      action_required: alertData.action_required || '',
      impact: alertData.impact || {},
      data: {
        current_stock: currentInventory,
        predicted_demand: forecast.predicted_demand,
        weeks_of_stock: weeksOfStock,
        confidence,
        trend: forecast.trend
      },
      created_at: new Date(),
      acknowledged: false,
      resolved: false,
      delivered_via: []
    }
  }

  private static getActionDetails(action: string, currentPrice: number): string {
    switch (action) {
      case 'increase_price':
        return `Increase to $${(currentPrice * 1.05).toFixed(2)}`
      case 'decrease_price':
        return `Decrease to $${(currentPrice * 0.95).toFixed(2)}`
      case 'reorder_stock':
        return 'Reorder inventory immediately'
      default:
        return 'Maintain current strategy'
    }
  }

  // Simulate alert delivery (in production, would integrate with email/SMS services)
  static async deliverAlert(alert: Alert, deliveryMethods: string[]): Promise<boolean> {
    console.log(`🚨 ALERT DELIVERY SIMULATION 🚨`)
    console.log(`Alert: ${alert.title}`)
    console.log(`Severity: ${alert.severity.toUpperCase()}`)
    console.log(`Message: ${alert.message}`)
    console.log(`Action: ${alert.action_required}`)
    console.log(`Delivery via: ${deliveryMethods.join(', ')}`)
    
    return true
  }

  // Generate alert summary for dashboard
  static generateAlertSummary(alerts: Alert[]) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    const highAlerts = alerts.filter(a => a.severity === 'high')
    const totalRevenueAtRisk = alerts.reduce((sum, a) => sum + (a.impact.revenue_at_risk || 0), 0)
    const totalOpportunity = alerts.reduce((sum, a) => sum + (a.impact.profit_opportunity || 0), 0)
    
    return {
      total_alerts: alerts.length,
      critical_alerts: criticalAlerts.length,
      high_priority_alerts: highAlerts.length,
      total_revenue_at_risk: Math.round(totalRevenueAtRisk),
      total_profit_opportunity: Math.round(totalOpportunity),
      most_urgent: alerts[0] || null,
      alert_types: this.groupAlertsByType(alerts)
    }
  }

  private static groupAlertsByType(alerts: Alert[]) {
    const grouped: Record<string, number> = {}
    alerts.forEach(alert => {
      grouped[alert.type] = (grouped[alert.type] || 0) + 1
    })
    return grouped
  }

  // Check if enough time has passed since last alert (respects frequency settings)
  static shouldSendAlert(rule: AlertRule): boolean {
    if (!rule.last_triggered) return true
    
    const now = new Date()
    const timeSinceLastAlert = now.getTime() - rule.last_triggered.getTime()
    
    switch (rule.frequency) {
      case 'immediate':
        return timeSinceLastAlert > 60 * 60 * 1000 // 1 hour
      case 'daily':
        return timeSinceLastAlert > 24 * 60 * 60 * 1000 // 24 hours
      case 'weekly':
        return timeSinceLastAlert > 7 * 24 * 60 * 60 * 1000 // 7 days
      default:
        return true
    }
  }

// Generate human-readable alert insights
static generateInsights(alerts: Alert[]): string[] {
  const insights: string[] = []
  
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  if (criticalCount > 0) {
    insights.push(`${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} require immediate attention`)
  }
  
  const stockoutAlerts = alerts.filter(a => a.type === 'stockout')
  if (stockoutAlerts.length > 0) {
    insights.push(`${stockoutAlerts.length} SKU${stockoutAlerts.length > 1 ? 's' : ''} at risk of stockout`)
  }
  
  const opportunities = alerts.filter(a => a.impact.profit_opportunity && a.impact.profit_opportunity > 0)
  if (opportunities.length > 0) {
    const totalOpportunity = opportunities.reduce((sum, a) => sum + (a.impact.profit_opportunity || 0), 0)
    insights.push(`$${Math.round(totalOpportunity)} in revenue opportunities identified`)
  }
  
  const demandSpikes = alerts.filter(a => a.type === 'demand_spike')
  if (demandSpikes.length > 0) {
    insights.push(`${demandSpikes.length} demand surge${demandSpikes.length > 1 ? 's' : ''} detected`)
  }
  
  return insights
}
}
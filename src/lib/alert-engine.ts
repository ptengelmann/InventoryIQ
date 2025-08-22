// REPLACE: /src/lib/alert-engine.ts
// Enhanced Alert Engine for Alcohol Industry

import { AlcoholAIEngine } from './ai-engine'
import { AlcoholSKU, CompetitorPrice, AlcoholInventoryAlert } from '@/types'

export interface AlcoholAlertRule {
  id: string
  name: string
  type: 'stockout' | 'overstock' | 'price_opportunity' | 'demand_spike' | 'trend_change' | 
        'seasonal_prep' | 'competitor_threat' | 'expiration_risk' | 'compliance_alert'
  severity: 'low' | 'medium' | 'high' | 'critical'
  category_filter?: string[] // beer, wine, spirits, etc.
  conditions: {
    weeks_of_stock_below?: number
    weeks_of_stock_above?: number
    confidence_threshold?: number
    revenue_opportunity_above?: number
    demand_change_percentage?: number
    competitor_price_difference?: number
    days_to_seasonal_peak?: number
    days_to_expiration?: number
    abv_threshold?: number
    price_threshold?: number
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
  category: string
  type: AlcoholAlertRule['type']
  severity: AlcoholAlertRule['severity']
  title: string
  message: string
  action_required: string
  impact: {
    revenue_at_risk?: number
    profit_opportunity?: number
    time_to_critical?: number
    compliance_risk?: boolean
    competitive_threat?: boolean
  }
  data: {
    current_stock: number
    predicted_demand: number
    weeks_of_stock: number
    confidence: number
    trend: string
    seasonal_factor?: number
    competitor_count?: number
    days_to_expiration?: number
  }
  alcohol_context?: {
    abv: number
    shelf_life_days?: number
    seasonal_peak?: string
    competitor_prices?: CompetitorPrice[]
    compliance_notes?: string[]
  }
  created_at: Date
  acknowledged: boolean
  resolved: boolean
  delivered_via: string[]
}

export class AlcoholAlertEngine {
  private static alertCounter = 0

  private static generateUniqueId(sku: string, ruleType: string): string {
    const timestamp = Date.now()
    const counter = ++AlcoholAlertEngine.alertCounter
    const random = Math.random().toString(36).substr(2, 8)
    return `alert-${timestamp}-${counter}-${sku}-${ruleType}-${random}`
  }

  // Enhanced alert rules for alcohol industry
  static getAlcoholAlertRules(): AlcoholAlertRule[] {
    return [
      {
        id: 'critical-stockout',
        name: 'Critical Stockout Warning',
        type: 'stockout',
        severity: 'critical',
        conditions: {
          weeks_of_stock_below: 1,
          confidence_threshold: 0.4
        },
        delivery_methods: ['email', 'push', 'sms'],
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: 'seasonal-stockout-risk',
        name: 'Seasonal Stockout Risk',
        type: 'seasonal_prep',
        severity: 'high',
        conditions: {
          weeks_of_stock_below: 4,
          days_to_seasonal_peak: 30
        },
        delivery_methods: ['email', 'push'],
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: 'competitor-pricing-threat',
        name: 'Competitor Pricing Threat',
        type: 'competitor_threat',
        severity: 'medium',
        conditions: {
          competitor_price_difference: -15, // Competitors 15% cheaper
          confidence_threshold: 0.6
        },
        delivery_methods: ['email'],
        enabled: true,
        frequency: 'daily'
      },
      {
        id: 'expiration-risk',
        name: 'Product Expiration Risk',
        type: 'expiration_risk',
        severity: 'high',
        category_filter: ['beer', 'cider'], // Categories with shorter shelf life
        conditions: {
          days_to_expiration: 30,
          weeks_of_stock_above: 4
        },
        delivery_methods: ['email', 'push'],
        enabled: true,
        frequency: 'weekly'
      },
      {
        id: 'premium-spirits-opportunity',
        name: 'Premium Spirits Pricing Opportunity',
        type: 'price_opportunity',
        severity: 'medium',
        category_filter: ['spirits'],
        conditions: {
          price_threshold: 50, // Premium spirits over $50
          revenue_opportunity_above: 100,
          abv_threshold: 35
        },
        delivery_methods: ['email'],
        enabled: true,
        frequency: 'weekly'
      },
      {
        id: 'holiday-demand-spike',
        name: 'Holiday Demand Surge',
        type: 'demand_spike',
        severity: 'high',
        conditions: {
          demand_change_percentage: 25,
          days_to_seasonal_peak: 14
        },
        delivery_methods: ['email', 'push'],
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: 'overstock-craft-beer',
        name: 'Craft Beer Overstock',
        type: 'overstock',
        severity: 'medium',
        category_filter: ['beer'],
        conditions: {
          weeks_of_stock_above: 8,
          days_to_expiration: 60
        },
        delivery_methods: ['email'],
        enabled: true,
        frequency: 'weekly'
      },
      {
        id: 'compliance-volume-threshold',
        name: 'Compliance Volume Threshold',
        type: 'compliance_alert',
        severity: 'high',
        conditions: {
          // This would be calculated based on state regulations
        },
        delivery_methods: ['email', 'push'],
        enabled: true,
        frequency: 'immediate'
      }
    ]
  }

  // Analyze alcohol inventory and generate enhanced alerts
  static analyzeAndGenerateAlcoholAlerts(
    alcoholSKUs: AlcoholSKU[],
    competitorData: CompetitorPrice[] = [],
    alertRules: AlcoholAlertRule[]
  ): Alert[] {
    const alerts: Alert[] = []
    
    // Use enhanced AI engine for alcohol analysis
    const aiResult = AlcoholAIEngine.analyzeAlcoholBatch(alcoholSKUs, competitorData)
    
    for (const result of aiResult.batch_results) {
      const { sku, category, current_metrics, forecast } = result
      const alcoholSKU = alcoholSKUs.find(s => s.sku === sku)
      if (!alcoholSKU) continue
      
      const weeksOfStock = current_metrics.inventory / (current_metrics.weekly_sales || 0.1)
      const relatedCompetitors = competitorData.filter(c => c.sku === sku)
      
      // Check each alert rule
      for (const rule of alertRules.filter(r => r.enabled)) {
        // Skip if category filter doesn't match
        if (rule.category_filter && !rule.category_filter.includes(category)) {
          continue
        }
        
        const alert = this.checkAlcoholRule(rule, {
          alcoholSKU,
          currentPrice: current_metrics.price,
          currentInventory: current_metrics.inventory,
          weeklySales: current_metrics.weekly_sales,
          forecast,
          weeksOfStock,
          competitorPrices: relatedCompetitors
        })
        
        if (alert) {
          alerts.push(alert)
        }
      }
    }
    
    // Sort by severity and alcohol-specific priority
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const priorityA = severityOrder[a.severity]
      const priorityB = severityOrder[b.severity]
      
      if (priorityA !== priorityB) return priorityB - priorityA
      
      // Secondary sort by time sensitivity
      const timeWeight = {
        'stockout': 10,
        'seasonal_prep': 8,
        'expiration_risk': 7,
        'competitor_threat': 6,
        'compliance_alert': 9,
        'demand_spike': 8,
        'price_opportunity': 4,
        'overstock': 3,
        'trend_change': 2
      }
      
      return (timeWeight[b.type] || 0) - (timeWeight[a.type] || 0)
    })
  }

  // Enhanced rule checking for alcohol industry
  private static checkAlcoholRule(
    rule: AlcoholAlertRule,
    data: {
      alcoholSKU: AlcoholSKU
      currentPrice: number
      currentInventory: number
      weeklySales: number
      forecast: any
      weeksOfStock: number
      competitorPrices: CompetitorPrice[]
    }
  ): Alert | null {
    
    const { alcoholSKU, currentPrice, currentInventory, weeklySales, forecast, weeksOfStock, competitorPrices } = data
    const confidence = forecast.confidence_interval.confidence_level
    
    // Check confidence threshold
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
            title: `CRITICAL STOCKOUT: ${alcoholSKU.sku}`,
            message: `${alcoholSKU.brand} ${alcoholSKU.subcategory} will stockout in ${daysToStockout.toFixed(0)} days. Immediate reorder required to prevent lost sales.`,
            action_required: daysToStockout < 3 ? 'EMERGENCY REORDER NOW' : 'Schedule urgent reorder within 24 hours',
            impact: {
              revenue_at_risk: weeklySales * currentPrice * 4,
              time_to_critical: daysToStockout,
              compliance_risk: false
            }
          }
        }
        break

      case 'seasonal_prep':
        const seasonalPeakDays = forecast.alcohol_specific?.seasonal_peak_in_days || 365
        if (rule.conditions.days_to_seasonal_peak && 
            seasonalPeakDays < rule.conditions.days_to_seasonal_peak &&
            rule.conditions.weeks_of_stock_below && 
            weeksOfStock < rule.conditions.weeks_of_stock_below) {
          triggered = true
          alertData = {
            title: `Seasonal Prep Alert: ${alcoholSKU.sku}`,
            message: `${alcoholSKU.category} peak season in ${seasonalPeakDays} days. Current inventory insufficient for seasonal demand surge.`,
            action_required: `Increase inventory by ${Math.round(weeklySales * forecast.seasonality_factor * 4)} units for seasonal peak`,
            impact: {
              revenue_at_risk: weeklySales * currentPrice * forecast.seasonality_factor * 4,
              time_to_critical: seasonalPeakDays
            }
          }
        }
        break

      case 'competitor_threat':
        if (competitorPrices.length > 0 && rule.conditions.competitor_price_difference) {
          const avgCompPrice = competitorPrices.reduce((sum, c) => sum + c.competitor_price, 0) / competitorPrices.length
          const priceDifference = ((currentPrice - avgCompPrice) / avgCompPrice) * 100
          
          if (priceDifference > Math.abs(rule.conditions.competitor_price_difference)) {
            triggered = true
            const cheapestComp = Math.min(...competitorPrices.map(c => c.competitor_price))
            alertData = {
              title: `Competitor Threat: ${alcoholSKU.sku}`,
              message: `${alcoholSKU.sku} priced ${priceDifference.toFixed(1)}% above competitors. Cheapest competitor: $${cheapestComp}`,
              action_required: `Consider price adjustment to $${(avgCompPrice * 1.02).toFixed(2)} (2% above avg competitor)`,
              impact: {
                competitive_threat: true,
                revenue_at_risk: weeklySales * currentPrice * 0.2, // 20% sales risk
                profit_opportunity: weeklySales * (avgCompPrice - currentPrice) * 0.15 // Volume increase
              }
            }
          }
        }
        break

      case 'expiration_risk':
        if (alcoholSKU.shelf_life_days && rule.conditions.days_to_expiration && 
            rule.conditions.weeks_of_stock_above && weeksOfStock > rule.conditions.weeks_of_stock_above) {
          const daysOfStock = weeksOfStock * 7
          const expirationRisk = daysOfStock > (alcoholSKU.shelf_life_days * 0.7) // 70% of shelf life
          
          if (expirationRisk) {
            triggered = true
            const unitsAtRisk = Math.round(currentInventory * 0.3) // Assume 30% at risk
            alertData = {
              title: `Expiration Risk: ${alcoholSKU.sku}`,
              message: `${unitsAtRisk} units of ${alcoholSKU.sku} approaching expiration. ${alcoholSKU.shelf_life_days} day shelf life with ${daysOfStock.toFixed(0)} days of stock.`,
              action_required: 'Create promotional campaign: 20-30% discount to move excess inventory',
              impact: {
                revenue_at_risk: unitsAtRisk * currentPrice,
                time_to_critical: alcoholSKU.shelf_life_days - daysOfStock
              }
            }
          }
        }
        break

      case 'price_opportunity':
        const revenueOpportunity = forecast.recommendation.expected_impact.revenue_change
        const meetsThresholds = (
          (!rule.conditions.revenue_opportunity_above || revenueOpportunity > rule.conditions.revenue_opportunity_above) &&
          (!rule.conditions.price_threshold || currentPrice > rule.conditions.price_threshold) &&
          (!rule.conditions.abv_threshold || alcoholSKU.abv > rule.conditions.abv_threshold)
        )
        
        if (meetsThresholds) {
          triggered = true
          const newPrice = currentPrice * 1.05 // 5% increase
          alertData = {
            title: `Premium Pricing Opportunity: ${alcoholSKU.sku}`,
            message: `${alcoholSKU.brand} ${alcoholSKU.subcategory} (${alcoholSKU.abv}% ABV) showing strong demand. Premium positioning opportunity identified.`,
            action_required: `Test price increase to $${newPrice.toFixed(2)} (5% increase)`,
            impact: {
              profit_opportunity: revenueOpportunity,
              competitive_threat: false
            }
          }
        }
        break

      case 'demand_spike':
        if (forecast.trend === 'increasing') {
          const demandIncrease = ((forecast.predicted_demand - weeklySales) / weeklySales) * 100
          const nearSeasonalPeak = forecast.alcohol_specific?.seasonal_peak_in_days < (rule.conditions.days_to_seasonal_peak || 14)
          
          if (rule.conditions.demand_change_percentage && 
              demandIncrease > rule.conditions.demand_change_percentage && nearSeasonalPeak) {
            triggered = true
            alertData = {
              title: `Holiday Demand Surge: ${alcoholSKU.sku}`,
              message: `${demandIncrease.toFixed(0)}% demand spike predicted for ${alcoholSKU.sku}. Holiday season approaching in ${forecast.alcohol_specific?.seasonal_peak_in_days} days.`,
              action_required: 'Increase inventory and prepare promotional materials for peak season',
              impact: {
                revenue_at_risk: demandIncrease * currentPrice * weeklySales / 100,
                time_to_critical: forecast.alcohol_specific?.seasonal_peak_in_days || 14
              }
            }
          }
        }
        break

      case 'overstock':
        if (rule.conditions.weeks_of_stock_above && weeksOfStock > rule.conditions.weeks_of_stock_above) {
          const isPerishable = alcoholSKU.shelf_life_days && alcoholSKU.shelf_life_days < 365
          if (isPerishable || alcoholSKU.category === 'beer') {
            triggered = true
            const excessUnits = Math.round((weeksOfStock - 6) * weeklySales) // Target 6 weeks stock
            alertData = {
              title: `Overstock Alert: ${alcoholSKU.sku}`,
              message: `${excessUnits} excess units of ${alcoholSKU.sku}. ${weeksOfStock.toFixed(1)} weeks of stock for perishable product.`,
              action_required: 'Create bundle deal or promotional pricing to reduce inventory',
              impact: {
                profit_opportunity: excessUnits * currentPrice * 0.15 // 15% margin improvement
              }
            }
          }
        }
        break

      case 'compliance_alert':
        // Compliance alerts would be based on state regulations
        // This is a simplified example
        if (alcoholSKU.abv > 40 && currentInventory * currentPrice > 10000) {
          triggered = true
          alertData = {
            title: `Compliance Check: ${alcoholSKU.sku}`,
            message: `High-proof spirits inventory value exceeds reporting threshold. Ensure compliance with state regulations.`,
            action_required: 'Review state alcohol regulations and file required reports',
            impact: {
              compliance_risk: true,
              revenue_at_risk: 0 // Penalty avoidance rather than revenue
            }
          }
        }
        break
    }
    
    if (!triggered) return null
    
    return {
      id: AlcoholAlertEngine.generateUniqueId(alcoholSKU.sku, rule.type),
      rule_id: rule.id,
      sku: alcoholSKU.sku,
      category: alcoholSKU.category,
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
        trend: forecast.trend,
        seasonal_factor: forecast.seasonality_factor,
        competitor_count: competitorPrices.length,
        days_to_expiration: alcoholSKU.shelf_life_days
      },
      alcohol_context: {
        abv: alcoholSKU.abv,
        shelf_life_days: alcoholSKU.shelf_life_days,
        seasonal_peak: forecast.alcohol_specific?.seasonal_peak_in_days ? 
          `${forecast.alcohol_specific.seasonal_peak_in_days} days` : undefined,
        competitor_prices: competitorPrices,
        compliance_notes: forecast.alcohol_specific?.compliance_notes
      },
      created_at: new Date(),
      acknowledged: false,
      resolved: false,
      delivered_via: []
    }
  }

  // Enhanced alert summary for alcohol industry
  static generateAlcoholAlertSummary(alerts: Alert[]) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    const highAlerts = alerts.filter(a => a.severity === 'high')
    const complianceAlerts = alerts.filter(a => a.type === 'compliance_alert')
    const seasonalAlerts = alerts.filter(a => a.type === 'seasonal_prep')
    const competitorThreats = alerts.filter(a => a.type === 'competitor_threat')
    
    const totalRevenueAtRisk = alerts.reduce((sum, a) => sum + (a.impact.revenue_at_risk || 0), 0)
    const totalOpportunity = alerts.reduce((sum, a) => sum + (a.impact.profit_opportunity || 0), 0)
    
    // Category breakdown
    const categoryRisks = alerts.reduce((acc, alert) => {
      if (!acc[alert.category]) {
        acc[alert.category] = { count: 0, revenue_at_risk: 0, opportunities: 0 }
      }
      acc[alert.category].count++
      acc[alert.category].revenue_at_risk += alert.impact.revenue_at_risk || 0
      acc[alert.category].opportunities += alert.impact.profit_opportunity || 0
      return acc
    }, {} as Record<string, any>)
    
    return {
      total_alerts: alerts.length,
      critical_alerts: criticalAlerts.length,
      high_priority_alerts: highAlerts.length,
      compliance_alerts: complianceAlerts.length,
      seasonal_alerts: seasonalAlerts.length,
      competitor_threats: competitorThreats.length,
      total_revenue_at_risk: Math.round(totalRevenueAtRisk),
      total_profit_opportunity: Math.round(totalOpportunity),
      category_breakdown: categoryRisks,
      most_urgent: alerts[0] || null,
      alert_types: this.groupAlertsByType(alerts),
      alcohol_insights: this.generateAlcoholInsights(alerts)
    }
  }

  private static groupAlertsByType(alerts: Alert[]) {
    const grouped: Record<string, number> = {}
    alerts.forEach(alert => {
      grouped[alert.type] = (grouped[alert.type] || 0) + 1
    })
    return grouped
  }

  // Generate alcohol-specific insights
  static generateAlcoholInsights(alerts: Alert[]): string[] {
    const insights: string[] = []
    
    const criticalCount = alerts.filter(a => a.severity === 'critical').length
    if (criticalCount > 0) {
      insights.push(`${criticalCount} critical stockout${criticalCount > 1 ? 's' : ''} require immediate reordering`)
    }
    
    const seasonalAlerts = alerts.filter(a => a.type === 'seasonal_prep')
    if (seasonalAlerts.length > 0) {
      insights.push(`${seasonalAlerts.length} SKU${seasonalAlerts.length > 1 ? 's' : ''} need seasonal inventory preparation`)
    }
    
    const competitorThreats = alerts.filter(a => a.type === 'competitor_threat')
    if (competitorThreats.length > 0) {
      insights.push(`${competitorThreats.length} product${competitorThreats.length > 1 ? 's' : ''} facing competitive pricing pressure`)
    }
    
    const expirationRisks = alerts.filter(a => a.type === 'expiration_risk')
    if (expirationRisks.length > 0) {
      const totalAtRisk = expirationRisks.reduce((sum, a) => sum + (a.impact.revenue_at_risk || 0), 0)
      insights.push(`${Math.round(totalAtRisk)} in inventory at expiration risk - promotional pricing recommended`)
    }
    
    const premiumOpportunities = alerts.filter(a => 
      a.type === 'price_opportunity' && a.alcohol_context?.abv && a.alcohol_context.abv > 35
    )
    if (premiumOpportunities.length > 0) {
      insights.push(`${premiumOpportunities.length} premium spirit${premiumOpportunities.length > 1 ? 's' : ''} showing pricing opportunities`)
    }
    
    const complianceIssues = alerts.filter(a => a.impact.compliance_risk)
    if (complianceIssues.length > 0) {
      insights.push(`${complianceIssues.length} compliance check${complianceIssues.length > 1 ? 's' : ''} required`)
    }
    
    return insights
  }

  // Alcohol-specific alert delivery simulation
  static async deliverAlcoholAlert(alert: Alert, deliveryMethods: string[]): Promise<boolean> {
    console.log(`🍺 ALCOHOL INDUSTRY ALERT 🍺`)
    console.log(`Alert: ${alert.title}`)
    console.log(`Category: ${alert.category.toUpperCase()}`)
    console.log(`Severity: ${alert.severity.toUpperCase()}`)
    console.log(`Message: ${alert.message}`)
    console.log(`Action: ${alert.action_required}`)
    
    if (alert.alcohol_context) {
      console.log(`ABV: ${alert.alcohol_context.abv}%`)
      if (alert.alcohol_context.seasonal_peak) {
        console.log(`Seasonal Context: Peak in ${alert.alcohol_context.seasonal_peak}`)
      }
      if (alert.alcohol_context.competitor_prices && alert.alcohol_context.competitor_prices.length > 0) {
        console.log(`Competitor Count: ${alert.alcohol_context.competitor_prices.length}`)
      }
    }
    
    console.log(`Delivery via: ${deliveryMethods.join(', ')}`)
    console.log('---')
    
    return true
  }

  // Check if alert should be sent based on frequency and alcohol-specific timing
  static shouldSendAlcoholAlert(rule: AlcoholAlertRule, alert: Alert): boolean {
    if (!rule.last_triggered) return true
    
    const now = new Date()
    const timeSinceLastAlert = now.getTime() - rule.last_triggered.getTime()
    
    // More aggressive timing for critical alcohol alerts
    switch (rule.frequency) {
      case 'immediate':
        // For stockouts and seasonal prep, allow more frequent alerts
        if (rule.type === 'stockout' || rule.type === 'seasonal_prep') {
          return timeSinceLastAlert > 30 * 60 * 1000 // 30 minutes
        }
        return timeSinceLastAlert > 60 * 60 * 1000 // 1 hour
      case 'daily':
        return timeSinceLastAlert > 24 * 60 * 60 * 1000 // 24 hours
      case 'weekly':
        return timeSinceLastAlert > 7 * 24 * 60 * 60 * 1000 // 7 days
      default:
        return true
    }
  }
}
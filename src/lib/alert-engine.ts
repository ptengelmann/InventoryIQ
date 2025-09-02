// src/lib/alert-engine.ts
// Complete Alert Engine for InventoryIQ - Production Ready

export interface Alert {
  id: string
  rule_id: string
  sku: string
  category: string
  type: 'stockout' | 'overstock' | 'price_opportunity' | 'competitor_threat' | 'seasonal_prep' | 'demand_spike' | 'compliance' | 'expiration_risk'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  action_required: string
  impact: {
    revenue_at_risk?: number
    profit_opportunity?: number
    time_to_critical?: number
    urgency: number
  }
  data?: {
    current_stock?: number
    predicted_demand?: number
    weeks_of_stock?: number
    confidence?: number
    trend?: string
    competitor_data?: any[]
  }
  alcohol_context?: {
    abv?: number
    shelf_life_days?: number
    seasonal_peak?: string
    compliance_notes?: string[]
    category_risk?: string
  }
  created_at: Date
  acknowledged: boolean
  resolved: boolean
  delivered_via: string[]
  metadata?: {
    source: string
    analysis_id?: string
    confidence_score?: number
    auto_generated?: boolean
  }
}

export interface AlertRule {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  severity: Alert['severity']
  priority: number // 1-10, higher = more important
  conditions: {
    weeks_of_stock_below?: number
    weeks_of_stock_above?: number
    price_change_threshold?: number
    demand_spike_threshold?: number
    seasonal_factor?: number
    margin_threshold?: number
    velocity_threshold?: number
    days_since_sale?: number
    competitor_price_diff?: number
    abv_threshold?: number
  }
  alcohol_specific?: {
    applies_to_categories: string[]
    shelf_life_sensitive: boolean
    seasonal_sensitive: boolean
    compliance_relevant: boolean
    abv_threshold?: number
  }
  business_impact: {
    revenue_weight: number
    operational_weight: number
    strategic_weight: number
  }
}

export class AlertEngine {
  
  // Production-grade alert rules for alcohol inventory
  static ALERT_RULES: AlertRule[] = [
    {
      id: 'critical_stockout',
      name: 'Critical Stockout Risk',
      description: 'Product will run out of stock within 1 week',
      category: 'inventory',
      enabled: true,
      severity: 'critical',
      priority: 10,
      conditions: {
        weeks_of_stock_below: 1
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd', 'cider', 'sake'],
        shelf_life_sensitive: false,
        seasonal_sensitive: true,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 1.0,
        operational_weight: 0.8,
        strategic_weight: 0.3
      }
    },
    {
      id: 'seasonal_stockout_risk',
      name: 'Seasonal Stockout Risk',
      description: 'Product may run out during peak season',
      category: 'seasonal',
      enabled: true,
      severity: 'high',
      priority: 9,
      conditions: {
        weeks_of_stock_below: 4,
        seasonal_factor: 1.3
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: true,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.9,
        operational_weight: 0.7,
        strategic_weight: 0.8
      }
    },
    {
      id: 'expiration_risk',
      name: 'Expiration Risk',
      description: 'Product approaching expiration with high inventory',
      category: 'inventory',
      enabled: true,
      severity: 'high',
      priority: 8,
      conditions: {
        weeks_of_stock_above: 8
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'rtd', 'cider'],
        shelf_life_sensitive: true,
        seasonal_sensitive: false,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.8,
        operational_weight: 0.9,
        strategic_weight: 0.2
      }
    },
    {
      id: 'slow_mover_dead_stock',
      name: 'Slow Moving Dead Stock',
      description: 'Product not selling and tying up capital',
      category: 'inventory',
      enabled: true,
      severity: 'medium',
      priority: 6,
      conditions: {
        days_since_sale: 60,
        weeks_of_stock_above: 12
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd', 'cider', 'sake'],
        shelf_life_sensitive: true,
        seasonal_sensitive: false,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.4,
        operational_weight: 0.6,
        strategic_weight: 0.7
      }
    },
    {
      id: 'competitive_price_threat',
      name: 'Competitive Price Threat',
      description: 'Competitors pricing significantly lower',
      category: 'competitive',
      enabled: true,
      severity: 'medium',
      priority: 7,
      conditions: {
        competitor_price_diff: 15 // % above competitors
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: false,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.7,
        operational_weight: 0.3,
        strategic_weight: 0.9
      }
    },
    {
      id: 'pricing_opportunity',
      name: 'Pricing Opportunity',
      description: 'Product underpriced compared to market',
      category: 'opportunity',
      enabled: true,
      severity: 'medium',
      priority: 5,
      conditions: {
        competitor_price_diff: -10 // % below competitors
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: false,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.8,
        operational_weight: 0.2,
        strategic_weight: 0.6
      }
    },
    {
      id: 'high_velocity_reorder',
      name: 'High Velocity Reorder Alert',
      description: 'Fast-selling product needs proactive reordering',
      category: 'inventory',
      enabled: true,
      severity: 'medium',
      priority: 7,
      conditions: {
        weeks_of_stock_below: 3,
        velocity_threshold: 10 // units per week
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: true,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.8,
        operational_weight: 0.7,
        strategic_weight: 0.5
      }
    },
    {
      id: 'compliance_risk',
      name: 'Compliance Risk Alert',
      description: 'Product may have compliance issues requiring attention',
      category: 'compliance',
      enabled: true,
      severity: 'high',
      priority: 9,
      conditions: {
        abv_threshold: 40
      },
      alcohol_specific: {
        applies_to_categories: ['spirits'],
        shelf_life_sensitive: false,
        seasonal_sensitive: false,
        compliance_relevant: true,
        abv_threshold: 40
      },
      business_impact: {
        revenue_weight: 0.2,
        operational_weight: 0.9,
        strategic_weight: 1.0
      }
    },
    {
      id: 'margin_erosion',
      name: 'Margin Erosion Alert',
      description: 'Product margin falling below acceptable levels',
      category: 'financial',
      enabled: true,
      severity: 'medium',
      priority: 6,
      conditions: {
        margin_threshold: 15 // minimum margin percentage
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: false,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.9,
        operational_weight: 0.4,
        strategic_weight: 0.7
      }
    },
    {
      id: 'seasonal_prep',
      name: 'Seasonal Preparation Required',
      description: 'Prepare inventory for upcoming seasonal demand',
      category: 'seasonal',
      enabled: true,
      severity: 'medium',
      priority: 6,
      conditions: {
        weeks_of_stock_below: 6,
        seasonal_factor: 1.5
      },
      alcohol_specific: {
        applies_to_categories: ['beer', 'wine', 'spirits', 'rtd'],
        shelf_life_sensitive: false,
        seasonal_sensitive: true,
        compliance_relevant: false
      },
      business_impact: {
        revenue_weight: 0.7,
        operational_weight: 0.6,
        strategic_weight: 0.8
      }
    }
  ]

  // Enhanced alert generation with improved logic
  static generateAlertsFromAnalysis(
    alcoholSKUs: any[],
    analysisResults: any[],
    competitorData: any[] = [],
    options: {
      maxAlertsPerSKU?: number
      minSeverityLevel?: 'low' | 'medium' | 'high' | 'critical'
      includeOpportunities?: boolean
      analysisId?: string
    } = {}
  ): Alert[] {
    const {
      maxAlertsPerSKU = 3,
      minSeverityLevel = 'low',
      includeOpportunities = true,
      analysisId = 'unknown'
    } = options

    const alerts: Alert[] = []
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const minSeverityValue = severityOrder[minSeverityLevel]

    console.log(`Generating alerts for ${alcoholSKUs.length} SKUs with ${this.ALERT_RULES.length} rules`)

    for (const sku of alcoholSKUs) {
      const skuResults = analysisResults.find(r => r.sku === sku.sku)
      const relatedCompetitors = competitorData.filter(c => c.sku === sku.sku)
      const skuAlerts: Alert[] = []

      // Check each alert rule
      for (const rule of this.ALERT_RULES.filter(r => r.enabled)) {
        // Skip if rule doesn't meet minimum severity
        if (severityOrder[rule.severity] < minSeverityValue) continue
        
        // Skip opportunities if not requested
        if (!includeOpportunities && rule.category === 'opportunity') continue

        const alert = this.evaluateAlertRule(rule, sku, skuResults, relatedCompetitors, analysisId)
        if (alert) {
          skuAlerts.push(alert)
        }
      }

      // Sort by priority and take top N per SKU
      skuAlerts
        .sort((a, b) => {
          const ruleA = this.ALERT_RULES.find(r => r.id === a.rule_id)
          const ruleB = this.ALERT_RULES.find(r => r.id === b.rule_id)
          return (ruleB?.priority || 0) - (ruleA?.priority || 0)
        })
        .slice(0, maxAlertsPerSKU)
        .forEach(alert => alerts.push(alert))
    }

    // Final sort by urgency and severity
    const finalAlerts = alerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return b.impact.urgency - a.impact.urgency
    })

    console.log(`Generated ${finalAlerts.length} alerts across ${alcoholSKUs.length} SKUs`)
    
    return finalAlerts
  }

  // Enhanced rule evaluation with better business logic
  private static evaluateAlertRule(
    rule: AlertRule,
    alcoholSKU: any,
    analysisResult: any,
    competitorData: any[],
    analysisId: string = 'unknown'
  ): Alert | null {
    
    // Parse SKU data with fallbacks
    const weeklySales = Math.max(0.01, parseFloat(alcoholSKU.weekly_sales) || 0.01)
    const inventoryLevel = Math.max(0, parseInt(alcoholSKU.inventory_level) || 0)
    const currentPrice = Math.max(0, parseFloat(alcoholSKU.price) || 0)
    const weeksOfStock = inventoryLevel / weeklySales
    const daysSinceSale = alcoholSKU.days_since_sale || this.estimateDaysSinceSale(weeklySales)
    
    // Check if rule applies to this category
    if (rule.alcohol_specific?.applies_to_categories && 
        !rule.alcohol_specific.applies_to_categories.includes(alcoholSKU.category)) {
      return null
    }

    let triggersAlert = false
    let alertMessage = ''
    let actionRequired = ''
    let revenueAtRisk = 0
    let profitOpportunity = 0
    let timeToCritical = 0
    let confidenceScore = 0.7

    switch (rule.id) {
      case 'critical_stockout':
        triggersAlert = weeksOfStock < (rule.conditions.weeks_of_stock_below || 1)
        if (triggersAlert) {
          const daysLeft = Math.max(1, Math.floor(weeksOfStock * 7))
          alertMessage = `${alcoholSKU.sku} will stockout in ${daysLeft} days. Current stock: ${inventoryLevel} units, weekly demand: ${weeklySales.toFixed(1)} units.`
          actionRequired = `EMERGENCY REORDER: Order ${Math.ceil(weeklySales * 8)} units immediately`
          revenueAtRisk = weeklySales * currentPrice * 6 // 6 weeks of lost sales
          timeToCritical = daysLeft
          confidenceScore = 0.95
        }
        break

      case 'seasonal_stockout_risk':
        const isSeasonalPeak = this.isApproachingSeasonalPeak(alcoholSKU.category)
        const seasonalDemandMultiplier = this.getSeasonalMultiplier(alcoholSKU.category)
        const adjustedWeeksOfStock = weeksOfStock / seasonalDemandMultiplier
        
        triggersAlert = adjustedWeeksOfStock < (rule.conditions.weeks_of_stock_below || 4) && isSeasonalPeak
        if (triggersAlert) {
          alertMessage = `${alcoholSKU.sku} insufficient for peak ${alcoholSKU.category} season. Current: ${weeksOfStock.toFixed(1)} weeks, need: ${(rule.conditions.weeks_of_stock_below! * seasonalDemandMultiplier).toFixed(1)} weeks.`
          actionRequired = `SEASONAL PREP: Order ${Math.ceil(weeklySales * seasonalDemandMultiplier * 8)} units before peak season`
          revenueAtRisk = weeklySales * currentPrice * seasonalDemandMultiplier * 4
          timeToCritical = this.getDaysToSeasonalPeak(alcoholSKU.category)
          confidenceScore = 0.8
        }
        break

      case 'expiration_risk':
        const hasShelfLife = alcoholSKU.shelf_life_days && alcoholSKU.shelf_life_days < 730 // 2 years
        const isPerishable = ['beer', 'wine', 'rtd', 'cider'].includes(alcoholSKU.category)
        
        triggersAlert = weeksOfStock > (rule.conditions.weeks_of_stock_above || 8) && (hasShelfLife || isPerishable)
        if (triggersAlert) {
          const estimatedShelfLife = alcoholSKU.shelf_life_days || this.getDefaultShelfLife(alcoholSKU.category)
          const daysUntilExpiration = Math.max(0, estimatedShelfLife - (weeksOfStock * 7))
          
          alertMessage = `${alcoholSKU.sku} overstock risk: ${weeksOfStock.toFixed(1)} weeks of stock with ${Math.round(daysUntilExpiration)} days until expiration concern.`
          actionRequired = `PROMOTIONAL PRICING: Implement 20-30% discount or bundle strategy within 2 weeks`
          revenueAtRisk = inventoryLevel * currentPrice * 0.4 // 40% loss on expired/unsellable stock
          timeToCritical = Math.max(7, daysUntilExpiration - 60) // Start action 60 days before expiration
          confidenceScore = hasShelfLife ? 0.9 : 0.6
        }
        break

      case 'slow_mover_dead_stock':
        triggersAlert = (
          daysSinceSale > (rule.conditions.days_since_sale || 60) &&
          weeksOfStock > (rule.conditions.weeks_of_stock_above || 12)
        )
        if (triggersAlert) {
          const tiedUpCapital = inventoryLevel * (alcoholSKU.cost_price || currentPrice * 0.7)
          alertMessage = `${alcoholSKU.sku} dead stock: ${daysSinceSale} days since last sale, ${inventoryLevel} units tying up £${tiedUpCapital.toFixed(0)} capital.`
          actionRequired = `LIQUIDATION STRATEGY: Bundle, clearance sale, or write-off consideration`
          revenueAtRisk = tiedUpCapital * 0.5 // Opportunity cost of tied-up capital
          timeToCritical = 30 // Act within 30 days
          confidenceScore = daysSinceSale > 90 ? 0.9 : 0.7
        }
        break

      case 'competitive_price_threat':
        if (competitorData.length > 0) {
          const avgCompPrice = competitorData.reduce((sum, c) => sum + c.competitor_price, 0) / competitorData.length
          const priceDifference = ((currentPrice - avgCompPrice) / avgCompPrice) * 100
          
          triggersAlert = priceDifference > (rule.conditions.competitor_price_diff || 15)
          if (triggersAlert) {
            const marketPosition = this.getMarketPosition(currentPrice, competitorData)
            alertMessage = `${alcoholSKU.sku} pricing threat: ${priceDifference.toFixed(1)}% above market (£${currentPrice} vs avg £${avgCompPrice.toFixed(2)}). Market position: ${marketPosition}.`
            actionRequired = `PRICE REVIEW: Consider reducing to £${(avgCompPrice * 1.05).toFixed(2)} (5% premium) within 1 week`
            revenueAtRisk = weeklySales * currentPrice * 12 * Math.min(0.3, priceDifference / 100) // Volume loss over 3 months
            timeToCritical = 14 // 2 weeks to respond
            confidenceScore = competitorData.length >= 3 ? 0.85 : 0.6
          }
        }
        break

      case 'pricing_opportunity':
        if (competitorData.length > 0) {
          const avgCompPrice = competitorData.reduce((sum, c) => sum + c.competitor_price, 0) / competitorData.length
          const priceDifference = ((currentPrice - avgCompPrice) / avgCompPrice) * 100
          
          triggersAlert = priceDifference < (rule.conditions.competitor_price_diff || -10)
          if (triggersAlert) {
            const opportunityPrice = avgCompPrice * 0.95 // 5% below market average
            const additionalRevenue = (opportunityPrice - currentPrice) * weeklySales * 12
            
            alertMessage = `${alcoholSKU.sku} pricing opportunity: ${Math.abs(priceDifference).toFixed(1)}% below market. Can increase to £${opportunityPrice.toFixed(2)}.`
            actionRequired = `PRICE INCREASE: Implement gradual increase to £${opportunityPrice.toFixed(2)} over 2-4 weeks`
            profitOpportunity = additionalRevenue
            timeToCritical = 30 // Implement within 30 days
            confidenceScore = competitorData.length >= 3 ? 0.8 : 0.6
          }
        }
        break

      case 'high_velocity_reorder':
        const isHighVelocity = weeklySales >= (rule.conditions.velocity_threshold || 10)
        triggersAlert = (
          isHighVelocity &&
          weeksOfStock < (rule.conditions.weeks_of_stock_below || 3)
        )
        if (triggersAlert) {
          const recommendedReorder = weeklySales * 6 // 6 weeks of stock
          alertMessage = `${alcoholSKU.sku} high-velocity reorder needed: ${weeklySales.toFixed(1)} units/week, only ${weeksOfStock.toFixed(1)} weeks remaining.`
          actionRequired = `PROACTIVE REORDER: Order ${Math.ceil(recommendedReorder)} units to maintain service levels`
          revenueAtRisk = weeklySales * currentPrice * 2 // 2 weeks of potential stockout
          timeToCritical = Math.max(3, Math.floor(weeksOfStock * 7))
          confidenceScore = 0.9
        }
        break

      case 'compliance_risk':
        const isHighABV = alcoholSKU.abv && alcoholSKU.abv >= (rule.conditions.abv_threshold || 40)
        const isImported = alcoholSKU.origin_country && alcoholSKU.origin_country !== 'UK'
        const hasComplianceRisk = isHighABV || isImported || alcoholSKU.category === 'spirits'
        
        triggersAlert = hasComplianceRisk && weeklySales > 5 // Focus on higher volume items
        if (triggersAlert) {
          const riskFactors = []
          if (isHighABV) riskFactors.push(`High ABV (${alcoholSKU.abv}%)`)
          if (isImported) riskFactors.push(`Imported from ${alcoholSKU.origin_country}`)
          if (alcoholSKU.category === 'spirits') riskFactors.push('Spirits category regulations')
          
          alertMessage = `${alcoholSKU.sku} compliance review needed: ${riskFactors.join(', ')}. Weekly volume: ${weeklySales.toFixed(1)} units.`
          actionRequired = `COMPLIANCE CHECK: Review tax, labeling, and distribution requirements within 2 weeks`
          revenueAtRisk = weeklySales * currentPrice * 4 * 0.1 // 10% potential penalty/issue cost
          timeToCritical = 14
          confidenceScore = 0.7
        }
        break

      case 'margin_erosion':
        const estimatedCostPrice = alcoholSKU.cost_price || currentPrice * 0.65 // Assume 35% margin if cost unknown
        const currentMargin = ((currentPrice - estimatedCostPrice) / currentPrice) * 100
        
        triggersAlert = currentMargin < (rule.conditions.margin_threshold || 15) && weeklySales > 1
        if (triggersAlert) {
          const targetMargin = rule.conditions.margin_threshold || 15
          const targetPrice = estimatedCostPrice / (1 - targetMargin / 100)
          
          alertMessage = `${alcoholSKU.sku} margin erosion: ${currentMargin.toFixed(1)}% margin below ${targetMargin}% target. Cost: £${estimatedCostPrice.toFixed(2)}, Price: £${currentPrice.toFixed(2)}.`
          actionRequired = `MARGIN RECOVERY: Increase price to £${targetPrice.toFixed(2)} or reduce costs`
          profitOpportunity = (targetPrice - currentPrice) * weeklySales * 12
          timeToCritical = 30
          confidenceScore = alcoholSKU.cost_price ? 0.9 : 0.6
        }
        break

      case 'seasonal_prep':
        const isApproachingSeason = this.isApproachingSeasonalPeak(alcoholSKU.category)
        const seasonalMultiplier = this.getSeasonalMultiplier(alcoholSKU.category)
        const seasonalWeeksNeeded = (rule.conditions.weeks_of_stock_below || 6) * seasonalMultiplier
        
        triggersAlert = isApproachingSeason && weeksOfStock < seasonalWeeksNeeded
        if (triggersAlert) {
          const additionalUnitsNeeded = Math.ceil((seasonalWeeksNeeded - weeksOfStock) * weeklySales)
          const daysToSeason = this.getDaysToSeasonalPeak(alcoholSKU.category)
          
          alertMessage = `${alcoholSKU.sku} seasonal preparation: Need ${seasonalWeeksNeeded.toFixed(1)} weeks stock for peak season, currently have ${weeksOfStock.toFixed(1)} weeks.`
          actionRequired = `SEASONAL STOCK: Order additional ${additionalUnitsNeeded} units before peak season (${daysToSeason} days)`
          revenueAtRisk = additionalUnitsNeeded * currentPrice * 0.3 // 30% of potential seasonal uplift lost
          timeToCritical = Math.max(7, daysToSeason - 14) // Order 2 weeks before peak
          confidenceScore = 0.75
        }
        break
    }

    if (!triggersAlert) return null

    // Calculate final urgency score
    const baseUrgency = rule.severity === 'critical' ? 10 : rule.severity === 'high' ? 8 : rule.severity === 'medium' ? 5 : 3
    const timeUrgency = timeToCritical <= 7 ? 2 : timeToCritical <= 14 ? 1 : 0
    const impactUrgency = (revenueAtRisk + profitOpportunity) > 1000 ? 2 : (revenueAtRisk + profitOpportunity) > 500 ? 1 : 0
    const finalUrgency = Math.min(10, baseUrgency + timeUrgency + impactUrgency)

    return {
      id: `alert-${rule.id}-${alcoholSKU.sku}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rule_id: rule.id,
      sku: alcoholSKU.sku,
      category: alcoholSKU.category,
      type: this.mapRuleCategoryToAlertType(rule.category),
      severity: rule.severity,
      title: `${rule.severity.toUpperCase()}: ${alcoholSKU.sku} - ${rule.name}`,
      message: alertMessage,
      action_required: actionRequired,
      impact: {
        revenue_at_risk: Math.round(revenueAtRisk),
        profit_opportunity: profitOpportunity > 0 ? Math.round(profitOpportunity) : undefined,
        time_to_critical: timeToCritical,
        urgency: finalUrgency
      },
      data: {
        current_stock: inventoryLevel,
        predicted_demand: analysisResult?.forecast?.predicted_demand || weeklySales * 4,
        weeks_of_stock: Math.round(weeksOfStock * 10) / 10,
        confidence: confidenceScore,
        trend: this.determineTrend(analysisResult, weeklySales),
        competitor_data: competitorData.slice(0, 3) // Include top 3 competitors
      },
      alcohol_context: {
        abv: alcoholSKU.abv,
        shelf_life_days: alcoholSKU.shelf_life_days || this.getDefaultShelfLife(alcoholSKU.category),
        seasonal_peak: this.getSeasonalPeakDescription(alcoholSKU.category),
        compliance_notes: this.getComplianceNotes(alcoholSKU),
        category_risk: this.getCategoryRiskProfile(alcoholSKU.category)
      },
      created_at: new Date(),
      acknowledged: false,
      resolved: false,
      delivered_via: ['dashboard'],
      metadata: {
        source: 'alert_engine_v2',
        analysis_id: analysisId,
        confidence_score: confidenceScore,
        auto_generated: true
      }
    }
  }

  // Helper methods for enhanced functionality

  private static mapRuleCategoryToAlertType(category: string): Alert['type'] {
    const mapping: Record<string, Alert['type']> = {
      'inventory': 'stockout',
      'seasonal': 'seasonal_prep',
      'competitive': 'competitor_threat',
      'opportunity': 'price_opportunity',
      'compliance': 'compliance',
      'financial': 'price_opportunity'
    }
    return mapping[category] || 'stockout'
  }

  private static estimateDaysSinceSale(weeklySales: number): number {
    if (weeklySales > 5) return 1 // Fast movers
    if (weeklySales > 1) return 7 // Regular movers  
    if (weeklySales > 0.5) return 21 // Slow movers
    return 60 // Very slow movers
  }

  private static determineTrend(analysisResult: any, currentWeeklySales: number): string {
    if (analysisResult?.forecast?.trend) return analysisResult.forecast.trend
    
    // Simple heuristic based on sales velocity
    if (currentWeeklySales > 10) return 'increasing'
    if (currentWeeklySales < 0.5) return 'decreasing'
    return 'stable'
  }

  private static getMarketPosition(ourPrice: number, competitorData: any[]): string {
    if (competitorData.length === 0) return 'unknown'
    
    const prices = [ourPrice, ...competitorData.map(c => c.competitor_price)].sort((a, b) => a - b)
    const ourRank = prices.indexOf(ourPrice) + 1
    const totalCompetitors = prices.length
    
    if (ourRank === 1) return 'price leader (cheapest)'
    if (ourRank <= Math.ceil(totalCompetitors * 0.33)) return 'competitive'
    if (ourRank <= Math.ceil(totalCompetitors * 0.66)) return 'premium'
    return 'expensive'
  }

  private static isApproachingSeasonalPeak(category: string): boolean {
    const month = new Date().getMonth() + 1
    
    const seasonalPeaks: Record<string, number[]> = {
      beer: [5, 6, 7, 8], // May-August
      wine: [10, 11, 12, 1], // Oct-Jan
      spirits: [11, 12, 1], // Nov-Jan
      rtd: [4, 5, 6, 7, 8, 9], // Apr-Sep
      cider: [9, 10, 11], // Sep-Nov
      sake: [12, 1, 2] // Winter months
    }
    
    const peaks = seasonalPeaks[category] || []
    const currentMonth = month
    const nextMonth = (month % 12) + 1
    
    return peaks.includes(currentMonth) || peaks.includes(nextMonth)
  }

  private static getSeasonalMultiplier(category: string): number {
    const multipliers: Record<string, number> = {
      beer: 1.4,
      wine: 1.3,
      spirits: 1.5,
      rtd: 1.6,
      cider: 1.3,
      sake: 1.2
    }
    return multipliers[category] || 1.0
  }

  private static getDaysToSeasonalPeak(category: string): number {
    const month = new Date().getMonth() + 1
    const peakMonths: Record<string, number> = {
      beer: 6, // June
      wine: 12, // December
      spirits: 12, // December
      rtd: 6, // June
      cider: 10, // October
      sake: 1 // January
    }
    
    const peakMonth = peakMonths[category] || 6
    let monthsUntilPeak = peakMonth - month
    if (monthsUntilPeak <= 0) monthsUntilPeak += 12
    
    return Math.max(7, monthsUntilPeak * 30)
  }

  private static getDefaultShelfLife(category: string): number {
    const shelfLives: Record<string, number> = {
      beer: 120, // 4 months
      wine: 1095, // 3 years (varies greatly)
      spirits: 3650, // 10+ years
      rtd: 180, // 6 months
      cider: 365, // 1 year
      sake: 365 // 1 year
    }
    return shelfLives[category] || 365
  }

  private static getSeasonalPeakDescription(category: string): string {
    const descriptions: Record<string, string> = {
      beer: 'Summer months (May-August)',
      wine: 'Holiday season (Oct-Jan)',
      spirits: 'Holiday season (Nov-Jan)',
      rtd: 'Summer season (Apr-Sep)',
      cider: 'Autumn months (Sep-Nov)',
      sake: 'Winter months (Dec-Feb)'
    }
    return descriptions[category] || 'Year-round demand'
  }

  private static getCategoryRiskProfile(category: string): string {
    const profiles: Record<string, string> = {
      beer: 'Moderate - shelf life and seasonal sensitivity',
      wine: 'Low-Moderate - long shelf life but vintage sensitivity',
      spirits: 'Low - stable demand and long shelf life',
      rtd: 'High - seasonal, short shelf life, trend-sensitive',
      cider: 'Moderate-High - seasonal and shorter shelf life',
      sake: 'Moderate - cultural/niche market dependencies'
    }
    return profiles[category] || 'Unknown risk profile'
  }

  private static getComplianceNotes(alcoholSKU: any): string[] {
    const notes: string[] = []
    
    if (alcoholSKU.abv && alcoholSKU.abv > 40) {
      notes.push(`High-proof spirits (${alcoholSKU.abv}% ABV): Additional tax and regulatory requirements`)
    }
    
    if (alcoholSKU.origin_country && alcoholSKU.origin_country !== 'UK') {
      notes.push(`Imported product: Import duties, tariffs, and origin labeling requirements apply`)
    }
    
    if (alcoholSKU.category === 'beer' && alcoholSKU.abv && alcoholSKU.abv > 7.5) {
      notes.push('Strong beer category: Higher duty rate and potential age restriction considerations')
    }
    
    if (alcoholSKU.organic) {
      notes.push('Organic certification: Maintain organic compliance and labeling requirements')
    }
    
    if (alcoholSKU.vintage_year) {
      notes.push(`Vintage product (${alcoholSKU.vintage_year}): Age statement and authenticity requirements`)
    }
    
    if (notes.length === 0) {
      notes.push('Standard alcohol retail compliance applies')
    }
    
    return notes
  }

  // Advanced analytics and reporting methods

  static generateAlertSummary(alerts: Alert[]): {
    totalAlerts: number
    bySeverity: Record<string, number>
    byCategory: Record<string, number>
    byType: Record<string, number>
    totalRevenueAtRisk: number
    totalOpportunity: number
    averageUrgency: number
    topConcerns: Alert[]
  } {
    return {
      totalAlerts: alerts.length,
      bySeverity: this.groupBy(alerts, 'severity'),
      byCategory: this.groupBy(alerts, 'category'),
      byType: this.groupBy(alerts, 'type'),
      totalRevenueAtRisk: alerts.reduce((sum, a) => sum + (a.impact.revenue_at_risk || 0), 0),
      totalOpportunity: alerts.reduce((sum, a) => sum + (a.impact.profit_opportunity || 0), 0),
      averageUrgency: alerts.reduce((sum, a) => sum + a.impact.urgency, 0) / alerts.length,
      topConcerns: alerts
        .filter(a => a.severity === 'critical' || a.impact.urgency >= 8)
        .slice(0, 5)
    }
  }

  private static groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = item[key] || 'unknown'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  static filterAlertsByBusinessImpact(alerts: Alert[], minRevenue: number = 100): Alert[] {
    return alerts.filter(alert => {
      const totalImpact = (alert.impact.revenue_at_risk || 0) + (alert.impact.profit_opportunity || 0)
      return totalImpact >= minRevenue
    })
  }

  static prioritizeAlertsByUrgency(alerts: Alert[]): Alert[] {
    return [...alerts].sort((a, b) => {
      // Sort by severity first, then urgency, then revenue impact
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      
      const urgencyDiff = b.impact.urgency - a.impact.urgency
      if (urgencyDiff !== 0) return urgencyDiff
      
      const revenueA = (a.impact.revenue_at_risk || 0) + (a.impact.profit_opportunity || 0)
      const revenueB = (b.impact.revenue_at_risk || 0) + (b.impact.profit_opportunity || 0)
      return revenueB - revenueA
    })
  }
}
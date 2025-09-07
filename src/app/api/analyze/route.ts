// src/app/api/analyze/route.ts
// Main analysis endpoint with GPT-4 powered creative recommendations - FIXED

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import { GPTCommerceIntelligence } from '@/lib/gpt-commerce-intelligence'
import { AlcoholSKU, CompetitorPrice } from '@/types'
import { CompetitorIntelligenceService } from '@/lib/competitor-intelligence'
import { AlertEngine } from '@/lib/alert-engine'


interface AnalysisRequest {
  alcoholSKUs: AlcoholSKU[]
  userId: string
  userEmail: string
  analysisId: string
}

interface StandardRecommendation {
  sku: string
  category: string
  brand: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  action: string
  reason: string
  confidence: number
  weeklySales: number
  inventoryLevel: number
  weeksOfStock: number
  revenueImpact: number
  hasCreativeStrategy: boolean
  creativeStrategy: any
  competitorCount?: number // Added to show market context
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const requestData: AnalysisRequest = await request.json()
    const { alcoholSKUs, userId, userEmail, analysisId } = requestData
    
    if (!alcoholSKUs || !Array.isArray(alcoholSKUs)) {
      return NextResponse.json({ error: 'Invalid SKU data provided' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 })
    }

    console.log(`Starting advanced analysis for ${alcoholSKUs.length} SKUs for user ${userEmail}`)

    // Step 1: Identify slow-moving inventory for GPT-4 analysis
    const slowMovingProducts = await PostgreSQLService.getSlowMovingProducts(userId, 4)
    console.log(`Found ${slowMovingProducts.length} slow-moving products for creative analysis`)

    // Step 2: Get recent competitor data for context
    const recentCompetitorData = await PostgreSQLService.getCompetitorData(userId, 7)
    
    // Step 2.5: Fetch live competitor data for each SKU
    const competitorData: any[] = [];

    // Process each SKU to get competitor data
    for (const sku of alcoholSKUs) {
      try {
        // Prepare a clean product name for searching
        const productName = sku.brand 
          ? `${sku.brand} ${sku.category || ''}`
          : sku.sku.replace(/-/g, ' ');
        
        // Call the competitor API
        const response = await fetch(
          `http://localhost:3000/api/competitors/live?product=${encodeURIComponent(productName)}&category=${encodeURIComponent(sku.category || '')}&userId=${encodeURIComponent(userId)}`,
          { method: 'GET' }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Add competitor data to the collection with our SKU info
          if (data.competitors && data.competitors.length > 0) {
            data.competitors.forEach((competitor: any) => {
              competitorData.push({
                sku: sku.sku,
                our_price: parseFloat(sku.price),
                competitor: competitor.retailer,
                competitor_price: competitor.price,
                price_difference: parseFloat(sku.price) - competitor.price,
                price_difference_percentage: ((parseFloat(sku.price) - competitor.price) / competitor.price) * 100,
                availability: competitor.availability,
                product_name: competitor.product_name,
                url: competitor.url
              });
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching competitor data for ${sku.sku}:`, error);
      }
    }

    console.log(`Found ${competitorData.length} competitor prices for ${alcoholSKUs.length} SKUs`);
    
    // Step 3: Generate GPT-4 powered creative recommendations
    let creativeRecommendations: any[] = []
    let portfolioInsights: any = {}
    
    if (slowMovingProducts.length > 0) {
      console.log('Generating GPT-4 creative recommendations...')
      
      try {
        // Generate creative strategies for slow inventory
        creativeRecommendations = await GPTCommerceIntelligence.generateCreativeRecommendations(
          slowMovingProducts,
          alcoholSKUs,
          recentCompetitorData
        )
        
        // Generate portfolio-level insights
        portfolioInsights = await GPTCommerceIntelligence.generateInventoryInsights(
          alcoholSKUs,
          [] // Historical data would come from database
        )
        
        console.log(`Generated ${creativeRecommendations.length} creative strategies`)
      } catch (gptError) {
        console.error('GPT-4 analysis failed, continuing with standard analysis:', gptError)
        creativeRecommendations = []
        portfolioInsights = { error: 'AI recommendations unavailable' }
      }
    }

    // Step 4: Standard analytical recommendations with enhanced competitor awareness
    const standardRecommendations: StandardRecommendation[] = alcoholSKUs.map(sku => {
      const currentPrice = parseFloat(sku.price)
      const weeklySales = parseFloat(sku.weekly_sales)
      const inventoryLevel = parseInt(sku.inventory_level)
      const weeksOfStock = weeklySales > 0 ? inventoryLevel / weeklySales : 999

      // Get competitor data for this SKU
      const skuCompetitorData = competitorData.filter(comp => comp.sku === sku.sku)
      const competitorCount = skuCompetitorData.length
      
      // Calculate average competitor price if available
      let avgCompetitorPrice = 0
      if (competitorCount > 0) {
        avgCompetitorPrice = skuCompetitorData.reduce((sum, comp) => sum + comp.competitor_price, 0) / competitorCount
      }

      // Determine recommendation type with enhanced market intelligence
      let action = 'maintain_price'
      let recommendedPrice = currentPrice
      let confidence = 0.7
      let reason = 'Current pricing appears optimal'

      // Enhanced logic for recommendations
      if (weeksOfStock < 2) {
        action = 'reorder_stock'
        reason = `Critical stock level - only ${weeksOfStock.toFixed(1)} weeks of inventory remaining. Immediate reorder needed.`
        confidence = 0.95
        // If fast-moving and limited stock, consider a price increase
        if (weeklySales > 5) {
          recommendedPrice = currentPrice * 1.05
          reason += ' Consider a small price increase due to high demand.'
        }
      } else if (weeksOfStock > 12 && sku.shelf_life_days && sku.shelf_life_days < 365) {
        action = 'promotional_pricing'
        recommendedPrice = currentPrice * 0.85
        reason = `Overstock with limited shelf life - ${weeksOfStock.toFixed(1)} weeks of inventory vs. ${sku.shelf_life_days} days shelf life. Promotional pricing recommended.`
        confidence = 0.85
      } else if (weeklySales < 0.5 && inventoryLevel > 10) {
        action = 'clearance_or_bundle'
        recommendedPrice = currentPrice * 0.8
        reason = `Slow-moving product (${weeklySales} weekly sales) - consider clearance or bundling strategies to reduce inventory.`
        confidence = 0.8
      } else if (weeklySales > 5 && weeksOfStock < 8) {
        // Fast-moving with adequate stock - opportunity to optimize
        action = 'optimize_price'
        recommendedPrice = currentPrice * 1.08
        reason = `Strong demand (${weeklySales} weekly sales) with adequate inventory. Opportunity to increase margin.`
        confidence = 0.75
      }
      
      // Use competitor data if available to refine recommendations
      if (competitorCount > 0) {
        const priceDifference = currentPrice - avgCompetitorPrice
        const percentDifference = (priceDifference / avgCompetitorPrice) * 100
        
        if (percentDifference > 15 && action !== 'reorder_stock') {
          action = 'decrease_price'
          recommendedPrice = avgCompetitorPrice * 1.05 // Position slightly above competition
          reason = `Price is ${percentDifference.toFixed(1)}% above market average (${competitorCount} competitors). Recommend adjusting to maintain competitiveness.`
          confidence = 0.85
        } else if (percentDifference < -15 && weeklySales > 3) {
          action = 'increase_price'
          recommendedPrice = avgCompetitorPrice * 0.95 // Position slightly below competition
          reason = `Price is ${Math.abs(percentDifference).toFixed(1)}% below market with strong sales (${weeklySales}/week). Opportunity to increase margin while remaining competitive.`
          confidence = 0.8
        } else if (Math.abs(percentDifference) <= 15) {
          // Add competitor context to the reason
          reason += ` Price is within market range (${competitorCount} competitors analyzed).`
        }
      }

      // Round the recommended price to a nice number
      recommendedPrice = Math.round(recommendedPrice * 100) / 100

      // Find if this SKU has creative recommendations
      const creativeStrategy = creativeRecommendations.find(rec => 
        rec.products_involved && rec.products_involved.includes(sku.sku)
      )

      return {
        sku: sku.sku,
        category: sku.category,
        brand: sku.brand,
        currentPrice,
        recommendedPrice,
        changePercentage: ((recommendedPrice - currentPrice) / currentPrice) * 100,
        action,
        reason,
        confidence,
        weeklySales,
        inventoryLevel,
        weeksOfStock: Math.round(weeksOfStock * 10) / 10,
        revenueImpact: (recommendedPrice - currentPrice) * weeklySales * 4,
        hasCreativeStrategy: !!creativeStrategy,
        creativeStrategy: creativeStrategy || null,
        competitorCount // Add competitor count to show market context
      }
    })

    // Step 5: Generate alerts for critical issues
    const criticalAlerts = standardRecommendations
      .filter(rec => rec.weeksOfStock < 2 || (rec.weeksOfStock > 12 && rec.action === 'promotional_pricing'))
      .map(rec => ({
        id: `alert-${analysisId}-${rec.sku}`,
        type: rec.weeksOfStock < 2 ? 'stockout_risk' : 'overstock_risk',
        severity: rec.weeksOfStock < 1 ? 'critical' : 'high',
        product_sku: rec.sku,
        title: rec.weeksOfStock < 2 ? 
          `Critical Stock Alert: ${rec.sku}` : 
          `Overstock Alert: ${rec.sku}`,
        message: rec.weeksOfStock < 2 ? 
          `Only ${rec.weeksOfStock} weeks of stock remaining` :
          `${rec.weeksOfStock} weeks of stock - consider promotional pricing`,
        urgency_score: rec.weeksOfStock < 1 ? 10 : rec.weeksOfStock < 2 ? 8 : 6,
        estimated_impact: Math.abs(rec.revenueImpact),
        recommendation: {
          action: rec.action,
          timeline: rec.weeksOfStock < 2 ? 'immediate' : 'within_week',
          expected_outcome: rec.action === 'reorder_stock' ? 
            'Prevent stockouts and lost sales' : 
            'Clear overstock and recover cash flow'
        }
      }))

    // Step 6: Calculate comprehensive summary
    const categoryBreakdown = generateCategoryBreakdown(standardRecommendations)
    
    const summary = {
      totalSKUs: alcoholSKUs.length,
      slowMovingProducts: slowMovingProducts.length,
      creativeStrategiesGenerated: creativeRecommendations.length,
      criticalAlertsGenerated: criticalAlerts.length,
      
      priceIncreases: standardRecommendations.filter(r => r.changePercentage > 0).length,
      priceDecreases: standardRecommendations.filter(r => r.changePercentage < 0).length,
      noChange: standardRecommendations.filter(r => r.changePercentage === 0).length,
      
      totalRevenuePotential: standardRecommendations.reduce((sum, r) => sum + (r.revenueImpact || 0), 0),
      
      categoryBreakdown,
      
      // Add competitor data stats to summary
      brandsIdentified: alcoholSKUs.filter(sku => sku.brand).length,
      competitorPricesFound: competitorData.length,
      overPricedProducts: standardRecommendations.filter(r => r.action === 'decrease_price').length,
      underPricedProducts: standardRecommendations.filter(r => r.action === 'increase_price').length,
      marketInsightsGenerated: competitorData.length > 0 ? 3 : 0,
      
      portfolioHealth: {
        fastMovers: standardRecommendations.filter(r => r.weeklySales > 5).length,
        slowMovers: standardRecommendations.filter(r => r.weeklySales < 1).length,
        criticalStock: standardRecommendations.filter(r => r.weeksOfStock < 2).length,
        overstock: standardRecommendations.filter(r => r.weeksOfStock > 10).length
      }
    }

    // Generate market insights based on competitor data
    const marketInsights = generateMarketInsights(standardRecommendations, competitorData)

    const processingTime = Date.now() - startTime

    console.log(`Analysis completed in ${processingTime}ms`)
    console.log(`Generated ${creativeRecommendations.length} GPT-4 strategies`)
    console.log(`Created ${criticalAlerts.length} critical alerts`)
    console.log(`Found ${competitorData.length} competitor prices`)

// Step 7: Generate and save sophisticated alerts using AlertEngine
console.log('Generating sophisticated alerts using AlertEngine...')

try {
  const sophisticatedAlerts = AlertEngine.generateAlertsFromAnalysis(
    alcoholSKUs,
    standardRecommendations,
    competitorData,
    {
      maxAlertsPerSKU: 2,
      minSeverityLevel: 'medium',
      includeOpportunities: true,
      analysisId
    }
  )

  // Convert AlertEngine alerts to database format
  const dbAlerts = sophisticatedAlerts.map(alert => ({
    sku: alert.sku,
    riskLevel: alert.severity as 'low' | 'medium' | 'high' | 'critical',
    riskType: alert.type,
    weeksOfStock: alert.data?.weeks_of_stock || 0,
    priority: alert.impact.urgency,
    message: alert.message,
    aiEnhanced: true,
    revenueAtRisk: alert.impact.revenue_at_risk || 0
  }))

  // Save alerts to database
  await PostgreSQLService.saveAlerts(userId, analysisId, dbAlerts)
  console.log(`Saved ${dbAlerts.length} sophisticated alerts to database`)

} catch (alertError) {
  console.error('Alert generation failed:', alertError)
}

    return NextResponse.json({
      success: true,
      analysisId,
      processingTimeMs: processingTime,
      summary,
      
      // Standard recommendations
      recommendations: standardRecommendations.slice(0, 50), // Limit for performance
      
      // Competitor data
      competitorData,
      
      // Market insights
      marketInsights,
      
      // GPT-4 powered insights
      creativeStrategies: creativeRecommendations,
      portfolioInsights,
      
      // Alerts
      criticalAlerts,
      
      // Metadata
      aiPowered: creativeRecommendations.length > 0,
      processedAt: new Date().toISOString(),
      dataQuality: {
        skusProcessed: alcoholSKUs.length,
        slowMoversAnalyzed: slowMovingProducts.length,
        competitorDataPoints: competitorData.length
      }
    })

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper function for category breakdown
function generateCategoryBreakdown(recommendations: StandardRecommendation[]) {
  const breakdown = recommendations.reduce((acc, rec) => {
    const category = rec.category
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        avgRevenuePotential: 0,
        totalRevenuePotential: 0,
        slowMovers: 0,
        fastMovers: 0
      }
    }
    
    acc[category].count++
    acc[category].totalRevenuePotential += rec.revenueImpact || 0
    
    if (rec.weeklySales < 1) {
      acc[category].slowMovers++
    } else if (rec.weeklySales > 5) {
      acc[category].fastMovers++
    }
    
    return acc
  }, {} as Record<string, any>)

  // Calculate averages
  Object.keys(breakdown).forEach(category => {
    breakdown[category].avgRevenuePotential = breakdown[category].totalRevenuePotential / breakdown[category].count
  })

  return breakdown
}

// Generate market insights based on competitor data
function generateMarketInsights(recommendations: StandardRecommendation[], competitorData: any[]) {
  if (competitorData.length === 0) {
    return [];
  }
  
  // Group competitor data by SKU
  const competitorsByProduct = competitorData.reduce((acc, comp) => {
    if (!acc[comp.sku]) {
      acc[comp.sku] = [];
    }
    acc[comp.sku].push(comp);
    return acc;
  }, {} as Record<string, any[]>);
  
  const insights = [];
  
  // Generate pricing opportunity insight
  const underPricedProducts = recommendations.filter(r => 
    r.action === 'increase_price' && r.changePercentage < -10
  );
  
  if (underPricedProducts.length > 0) {
    insights.push({
      id: `insight-pricing-opportunity-${Date.now()}`,
      type: 'pricing',
      priority: underPricedProducts.length > 3 ? 'high' : 'medium',
      title: 'Premium Pricing Opportunity Identified',
      description: `${underPricedProducts.length} products in your portfolio are priced significantly below market average despite strong sales. Consider strategic price increases to optimize revenue while maintaining competitive positioning.`,
      impact: {
        revenue_potential: underPricedProducts.reduce((sum, p) => sum + p.revenueImpact, 0),
        risk_level: 'low',
        time_sensitivity: 'medium_term'
      },
      actionable_steps: [
        'Implement phased price increases over 4-6 weeks',
        'Monitor sales velocity for any changes after adjustments',
        'Highlight quality and unique value propositions in marketing'
      ],
      confidence_score: 0.85,
      related_products: underPricedProducts.slice(0, 3).map(p => p.sku)
    });
  }
  
  // Generate competitive risk insight
  const overPricedProducts = recommendations.filter(r => 
    r.action === 'decrease_price' && r.changePercentage > 10
  );
  
  if (overPricedProducts.length > 0) {
    insights.push({
      id: `insight-competitive-risk-${Date.now()}`,
      type: 'competitive',
      priority: overPricedProducts.length > 3 ? 'high' : 'medium',
      title: 'Competitive Price Risk Detected',
      description: `${overPricedProducts.length} products are priced significantly above market average, potentially impacting sales velocity. Strategic price adjustments recommended to maintain market position.`,
      impact: {
        revenue_potential: overPricedProducts.reduce((sum, p) => sum + Math.abs(p.revenueImpact), 0) / 2,
        risk_level: 'medium',
        time_sensitivity: 'short_term'
      },
      actionable_steps: [
        'Adjust pricing to within 5-10% of market average',
        'Review cost structure to identify efficiency opportunities',
        'Consider bundle offers to maintain margins while appearing more competitive'
      ],
      confidence_score: 0.8,
      related_products: overPricedProducts.slice(0, 3).map(p => p.sku)
    });
  }
  
  // Generate retailer-specific insight
  const retailers = new Set(competitorData.map(c => c.competitor));
  if (retailers.size > 0) {
    const retailerList = Array.from(retailers).slice(0, 3).join(', ');
    
    insights.push({
      id: `insight-market-trend-${Date.now()}`,
      type: 'trend',
      priority: 'medium',
      title: 'UK Retailer Pricing Analysis',
      description: `Comprehensive analysis of ${retailers.size} major UK retailers including ${retailerList} shows varying pricing strategies across your product categories. This provides opportunities for targeted positioning in different retail channels.`,
      impact: {
        revenue_potential: recommendations.reduce((sum, r) => sum + (r.revenueImpact > 0 ? r.revenueImpact : 0), 0) / 3,
        risk_level: 'low',
        time_sensitivity: 'medium_term'
      },
      actionable_steps: [
        'Develop channel-specific pricing strategies for key retailers',
        'Consider retailer-exclusive SKUs or packaging for premium positioning',
        'Monitor competitor promotional activities across all tracked retailers'
      ],
      confidence_score: 0.75,
      related_products: Object.keys(competitorsByProduct).slice(0, 3)
    });
  }
  
  return insights;
}
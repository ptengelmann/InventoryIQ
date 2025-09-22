// src/app/api/analyze/route.ts - FIXED VERSION
// Real competitive scraping integration + database saves

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping' // FIXED: Real scraping
import { EnhancedSeasonalRecommendations } from '@/lib/enhanced-seasonal-recommendations'
import { AlcoholSKU } from '@/types'
import { AlertEngine } from '@/lib/alert-engine'

interface CSVRow {
  sku?: string
  SKU?: string
  'Product Name'?: string
  'product_name'?: string
  price?: string
  Price?: string
  weekly_sales?: string
  'Weekly Sales'?: string
  'Weekly_Sales'?: string
  inventory_level?: string
  'Inventory Level'?: string
  'Inventory_Level'?: string
  category?: string
  Category?: string
  brand?: string
  Brand?: string
  subcategory?: string
  Subcategory?: string
  abv?: string
  ABV?: string
  volume_ml?: string
  Volume?: string
  container_type?: string
  'Container Type'?: string
  distributor?: string
  Distributor?: string
  [key: string]: any
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { csvData, fileName, userEmail } = body

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log(`🎯 Starting ENHANCED analysis with REAL competitive intelligence for ${userEmail}`)
    console.log(`📊 Processing ${csvData.length} rows from ${fileName}`)

    const uploadId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Step 1: Parse CSV data into AlcoholSKU format
    const alcoholSKUs: AlcoholSKU[] = csvData
      .filter((row: CSVRow) => row && typeof row === 'object')
      .map((row: CSVRow, index: number) => {
        const sku = row.sku || row.SKU || row['Product Code'] || `PRODUCT-${index + 1}`
        const price = parseFloat(row.price || row.Price || '0')
        const weekly_sales = parseFloat(row.weekly_sales || row['Weekly Sales'] || row['Weekly_Sales'] || '0')
        const inventory_level = parseInt(row.inventory_level || row['Inventory Level'] || row['Inventory_Level'] || '0')
        const rawCategory = row.category || row.Category || 'spirits'
        const brand = row.brand || row.Brand || row['Product Name'] || row['product_name'] || 'Unknown'

        // Map category to valid AlcoholSKU category values
        let category: "beer" | "wine" | "spirits" | "rtd" | "cider" | "sake" | "mead"
        const normalizedCategory = rawCategory.toLowerCase()
        
        if (normalizedCategory.includes('beer')) category = 'beer'
        else if (normalizedCategory.includes('wine')) category = 'wine'
        else if (normalizedCategory.includes('cider')) category = 'cider' 
        else if (normalizedCategory.includes('rtd') || normalizedCategory.includes('ready')) category = 'rtd'
        else if (normalizedCategory.includes('sake')) category = 'sake'
        else if (normalizedCategory.includes('mead')) category = 'mead'
        else category = 'spirits' // Default fallback

        let container_type: "bottle" | "can" | "keg" | "box" | "pouch"
        const rawContainerType = row.container_type || row['Container Type'] || 'bottle'
        const normalizedContainer = rawContainerType.toLowerCase()
        
        if (normalizedContainer.includes('can')) container_type = 'can'
        else if (normalizedContainer.includes('keg')) container_type = 'keg'
        else if (normalizedContainer.includes('box')) container_type = 'box'
        else if (normalizedContainer.includes('pouch')) container_type = 'pouch'
        else container_type = 'bottle'

        return {
          sku,
          price: price.toString(),
          weekly_sales: weekly_sales.toString(),
          inventory_level: inventory_level.toString(),
          category,
          brand,
          subcategory: row.subcategory || row.Subcategory || '',
          abv: parseFloat(row.abv || row.ABV || '0'),
          volume_ml: parseInt(row.volume_ml || row.Volume || '750'),
          container_type,
          distributor: row.distributor || row.Distributor || 'Unknown'
        }
      })
      .filter((sku: AlcoholSKU) => parseFloat(sku.price) > 0)

    console.log(`✅ Parsed ${alcoholSKUs.length} valid SKUs`)

    if (alcoholSKUs.length === 0) {
      return NextResponse.json({ 
        error: 'No valid product data found', 
        details: 'Please check your CSV format. Expected columns: SKU, Price, Weekly_Sales, Inventory_Level' 
      }, { status: 400 })
    }

    // Step 2: REAL COMPETITIVE INTELLIGENCE - High-value products only
    console.log('🕷️ Starting REAL competitive intelligence scraping...')
    let competitorData: any[] = []
    let competitiveScrapeTime = 0
    
    try {
      const competitiveStartTime = Date.now()
      
      // Select high-value products for competitive analysis (limit API costs)
      const highValueProducts = alcoholSKUs
        .filter(sku => parseFloat(sku.price) > 20) // Only products over £20
        .sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) // Sort by price desc
        .slice(0, 5) // Top 5 most expensive products
      
      console.log(`🎯 Selected ${highValueProducts.length} high-value products for competitive analysis`)
      
      for (const sku of highValueProducts) {
        try {
          console.log(`🔍 Scraping competitors for: ${sku.brand} ${sku.sku}`)
          
          // REAL COMPETITIVE SCRAPING with AI insights
          const competitorPrices = await RealCompetitiveScraping.scrapeRealCompetitorPrices(
            `${sku.brand} ${sku.subcategory || ''}`.trim(),
            sku.category,
            3, // Max 3 retailers per product to control costs
            true // Include AI insights
          )
          
          if (competitorPrices.length > 0) {
            // Set our price and calculate differences
            const ourPrice = parseFloat(sku.price)
            competitorPrices.forEach(comp => {
              comp.our_price = ourPrice
              comp.price_difference = comp.competitor_price - ourPrice
              comp.price_difference_percentage = ((comp.competitor_price - ourPrice) / ourPrice) * 100
              comp.sku = sku.sku // Set to our SKU code
            })
            
            competitorData.push(...competitorPrices)
            console.log(`✅ Found ${competitorPrices.length} real competitor prices for ${sku.sku}`)
          } else {
            console.log(`⚠️ No competitor data found for ${sku.sku}`)
          }
          
          // Rate limiting - be respectful to SERP API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (skuError) {
          console.error(`❌ Competitive scraping failed for ${sku.sku}:`, skuError)
          continue // Don't fail entire analysis for one SKU
        }
      }
      
      competitiveScrapeTime = Date.now() - competitiveStartTime
      console.log(`🎯 REAL competitive intelligence complete: ${competitorData.length} prices in ${competitiveScrapeTime}ms`)
      
    } catch (competitiveError) {
      console.error('❌ REAL competitive scraping failed:', competitiveError)
      console.log('📊 Continuing analysis without competitive data')
      competitorData = []
    }

    // Step 3: Generate Claude-powered price recommendations
    console.log('💰 Generating AI-powered price recommendations...')
    
    let priceRecommendations: any[] = []
    try {
      const { AIPriceRecommendations } = await import('@/lib/ai-price-recommendations')
      
      priceRecommendations = await AIPriceRecommendations.generateIntelligentPricing(
        alcoholSKUs,
        competitorData
      )
      
      console.log(`💰 Generated ${priceRecommendations.length} Claude-powered price recommendations`)
      
    } catch (pricingError) {
      console.error('❌ AI price recommendations failed, using fallback:', pricingError)
      
      // Basic fallback recommendations
      priceRecommendations = alcoholSKUs.slice(0, 25).map(sku => {
        const currentPrice = parseFloat(sku.price)
        const weeklySales = parseFloat(sku.weekly_sales)
        const inventoryLevel = parseInt(sku.inventory_level)
        const weeksOfStock = weeklySales > 0 ? inventoryLevel / weeklySales : 999

        let action = 'maintain_price'
        let recommendedPrice = currentPrice
        let reason = 'Current pricing appears optimal'

        if (weeksOfStock < 2) {
          action = 'reorder_stock'
          reason = `Critical stock level - ${weeksOfStock.toFixed(1)} weeks remaining`
        } else if (weeksOfStock > 12) {
          action = 'promotional_pricing'
          recommendedPrice = currentPrice * 0.85
          reason = `Overstock - ${weeksOfStock.toFixed(1)} weeks inventory`
        }

        return {
          sku: sku.sku,
          category: sku.category,
          brand: sku.brand,
          currentPrice,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          changePercentage: ((recommendedPrice - currentPrice) / currentPrice) * 100,
          action,
          reason,
          confidence: 0.7,
          weeklySales,
          inventoryLevel,
          weeksOfStock: Math.round(weeksOfStock * 10) / 10,
          revenueImpact: (recommendedPrice - currentPrice) * weeklySales * 4.33
        }
      })
    }

    // Step 4: Generate seasonal strategies
    console.log('🎄 Generating seasonal strategies...')
    
    let seasonalRecommendations: any[] = []
    try {
      const seasonalResults = await EnhancedSeasonalRecommendations.enhanceExistingRecommendations(
        priceRecommendations,
        alcoholSKUs,
        userEmail
      )
      
      seasonalRecommendations = seasonalResults.seasonal
      
      if (seasonalRecommendations.length > 0) {
        await PostgreSQLService.saveSeasonalStrategies(userEmail, uploadId, seasonalRecommendations)
        console.log(`💾 Saved ${seasonalRecommendations.length} seasonal strategies`)
      }
      
    } catch (seasonalError) {
      console.error('❌ Seasonal strategies failed:', seasonalError)
      seasonalRecommendations = []
    }

    // Step 5: Generate inventory alerts
    const inventoryAlerts = alcoholSKUs
      .map(sku => {
        const weeklySales = parseFloat(sku.weekly_sales)
        const inventoryLevel = parseInt(sku.inventory_level)
        const weeksOfStock = weeklySales > 0 ? inventoryLevel / weeklySales : 999
        const currentPrice = parseFloat(sku.price)

        const alerts: any[] = []

        if (weeksOfStock < 2) {
          alerts.push({
            sku: sku.sku,
            riskLevel: 'critical',
            riskType: 'stockout',
            weeksOfStock,
            priority: 10,
            message: `URGENT: Only ${weeksOfStock.toFixed(1)} weeks stock remaining`,
            revenueAtRisk: weeklySales * currentPrice * 8
          })
        }

        if (weeksOfStock > 12 && inventoryLevel > 20) {
          alerts.push({
            sku: sku.sku,
            riskLevel: 'high',
            riskType: 'overstock',
            weeksOfStock,
            priority: 7,
            message: `Overstock: ${weeksOfStock.toFixed(1)} weeks inventory`,
            revenueAtRisk: (inventoryLevel - (weeklySales * 8)) * currentPrice * 0.2
          })
        }

        return alerts
      })
      .flat()

    // Step 6: Generate AI market insights
    console.log('🧠 Generating AI market insights...')
    
    let marketInsights: any[] = []
    try {
      const { AIMarketInsights } = await import('@/lib/ai-market-insights')
      
      marketInsights = await AIMarketInsights.generateMarketInsights(
        alcoholSKUs,
        priceRecommendations,
        competitorData,
        seasonalRecommendations
      )
      
      console.log(`🧠 Generated ${marketInsights.length} AI market insights`)
      
    } catch (insightsError) {
      console.error('❌ AI market insights failed, using fallback:', insightsError)
      
      marketInsights = [{
        id: `fallback-insight-${Date.now()}`,
        type: 'competitive',
        priority: 'high',
        title: 'Real Competitive Intelligence Available',
        description: `Analysis found ${competitorData.length} real competitor prices from UK alcohol retailers.`,
        actionable_steps: [
          'Review competitor pricing above',
          'Monitor price changes in real-time',
          'Consider automated repricing strategies'
        ]
      }]
    }

    // Step 7: Calculate summary
    const summary = {
      totalSKUs: alcoholSKUs.length,
      priceIncreases: priceRecommendations.filter(r => r.changePercentage > 0).length,
      priceDecreases: priceRecommendations.filter(r => r.changePercentage < 0).length,
      noChange: priceRecommendations.filter(r => Math.abs(r.changePercentage) < 0.1).length,
      totalRevenuePotential: priceRecommendations.reduce((sum, r) => sum + (r.revenueImpact || 0), 0),
      seasonalStrategiesGenerated: seasonalRecommendations.length,
      seasonalRevenuePotential: seasonalRecommendations.reduce((sum, s) => sum + (s.estimated_revenue_impact || 0), 0),
      urgentSeasonalActions: seasonalRecommendations.filter(s => s.urgency === 'high' || s.urgency === 'critical').length,
      criticalAlertsGenerated: inventoryAlerts.filter(a => a.riskLevel === 'critical').length,
      brandsIdentified: alcoholSKUs.filter(sku => sku.brand && sku.brand !== 'Unknown').length,
      
      // REAL COMPETITIVE INTELLIGENCE METRICS
      competitorPricesFound: competitorData.length,
      realCompetitorData: true, // Flag to indicate real data
      competitiveScrapeTimeMs: competitiveScrapeTime,
      retailersCovered: [...new Set(competitorData.map(c => c.competitor))].length,
      
      portfolioHealth: {
        fastMovers: priceRecommendations.filter(r => r.weeklySales > 5).length,
        slowMovers: priceRecommendations.filter(r => r.weeklySales < 1).length,
        criticalStock: priceRecommendations.filter(r => r.weeksOfStock < 2).length,
        overstock: priceRecommendations.filter(r => r.weeksOfStock > 10).length
      }
    }

    const processingTime = Date.now() - startTime

    // Step 8: Save to database - INCLUDING REAL COMPETITOR DATA
    try {
      await PostgreSQLService.saveAnalysis({
        uploadId,
        fileName,
        userId: userEmail,
        userEmail,
        summary,
        priceRecommendations,
        inventoryAlerts,
        smartAlerts: [],
        competitorData, // FIXED: Real competitor data saved here
        marketInsights,
        processingTimeMs: processingTime,
        seasonalStrategies: seasonalRecommendations
      })
      
      console.log('💾 Analysis saved to database with REAL competitive intelligence')
      
      // CRITICAL: Save competitor prices separately to ensure they persist
      if (competitorData.length > 0) {
        const saved = await PostgreSQLService.saveCompetitorPrices(userEmail, competitorData)
        console.log(`✅ SEPARATELY SAVED ${competitorData.length} real competitor prices to database: ${saved}`)
      }
      
    } catch (saveError) {
      console.error('❌ Database save failed:', saveError)
    }

    console.log(`✅ Analysis completed in ${processingTime}ms`)
    console.log(`📊 Generated: ${priceRecommendations.length} price recs, ${seasonalRecommendations.length} seasonal strategies, ${marketInsights.length} insights`)
    console.log(`🎯 REAL COMPETITIVE DATA: ${competitorData.length} competitor prices from ${summary.retailersCovered} UK retailers`)

    // Step 9: Return results with real competitive intelligence
    return NextResponse.json({
      success: true,
      analysisId: uploadId,
      processingTimeMs: processingTime,
      summary,
      
      recommendations: priceRecommendations.slice(0, 100),
      seasonalStrategies: seasonalRecommendations,
      competitorData, // REAL competitor prices returned to UI
      marketInsights,
      criticalAlerts: inventoryAlerts.filter(alert => alert.riskLevel === 'critical' || alert.riskLevel === 'high'),
      
      // COMPETITIVE INTELLIGENCE METADATA
      competitiveIntelligence: {
        realData: true,
        retailersCovered: summary.retailersCovered,
        pricesFound: competitorData.length,
        processingTimeMs: competitiveScrapeTime,
        dataQuality: competitorData.length > 0 ? 'excellent' : 'no_data',
        costApproximate: `$${(competitorData.length * 0.01).toFixed(2)}`, // SERP API costs ~$0.01 per search
        nextUpdate: 'Real-time via /api/competitors/live'
      },
      
      metadata: {
        aiPowered: true,
        realCompetitiveData: true, // Flag for premium feature
        seasonallyEnhanced: seasonalRecommendations.length > 0,
        processedAt: new Date().toISOString(),
        fileName,
        dataQuality: {
          skusProcessed: alcoholSKUs.length,
          validPrices: alcoholSKUs.filter(sku => parseFloat(sku.price) > 0).length,
          withSalesData: alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) > 0).length,
          withInventoryData: alcoholSKUs.filter(sku => parseInt(sku.inventory_level) > 0).length,
          seasonalStrategiesGenerated: seasonalRecommendations.length,
          realCompetitorPrices: competitorData.length
        }
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Analysis failed:', error)
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
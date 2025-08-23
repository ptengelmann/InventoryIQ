// /src/app/api/upload/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from 'next/server'
import { parseCSVData, calculatePriceRecommendation, assessInventoryRisk, convertToAlcoholSKU } from '@/lib/utils'
import { DatabaseService } from '@/lib/models'
import { AlcoholAlertEngine as AlertEngine, Alert } from '@/lib/alert-engine'
import { AlcoholMarketIntelligence } from '@/lib/alcohol-market-intelligence'
import { AlcoholInsightsEngine } from '@/lib/alcohol-insights-engine'
import { EnhancedMockDataGenerator } from '@/lib/enhanced-mock-data'
import { AlcoholSKU, CompetitorPrice } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userEmail = formData.get('userEmail') as string
    const userId = formData.get('userId') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!userEmail || !userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    console.log(`Processing file: ${file.name} for user: ${userEmail}`)

    const content = await file.text()
    const { headers, data } = parseCSVData(content)
    
    console.log('CSV Headers found:', headers)
    console.log('Sample data rows:', data.slice(0, 2))
    console.log('Total rows:', data.length)
    
    // Enhanced column mapping
    const columnVariations = {
      sku: ['sku', 'product_id', 'item_id', 'code', 'product_code'],
      price: ['price', 'unit_price', 'cost', 'retail_price', 'selling_price'],
      weekly_sales: ['weekly_sales', 'sales', 'units_sold', 'quantity_sold', 'weekly_units', 'weekly_qty'],
      inventory_level: ['inventory_level', 'stock', 'inventory', 'stock_level', 'quantity', 'qty_on_hand']
    }
    
    const actualColumns: Record<string, string> = {}
    for (const [standardName, variations] of Object.entries(columnVariations)) {
      const foundColumn = variations.find(variation => 
        headers.some(header => header.toLowerCase().trim() === variation.toLowerCase())
      )
      if (foundColumn) {
        actualColumns[standardName] = headers.find(h => h.toLowerCase().trim() === foundColumn.toLowerCase()) || foundColumn
      }
    }
    
    console.log('Column mapping:', actualColumns)
    
    const requiredColumns = ['sku', 'price', 'weekly_sales', 'inventory_level']
    const missingColumns = requiredColumns.filter(col => !actualColumns[col])
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        found: headers,
        required: requiredColumns,
        suggestions: 'Try using column names like: sku, price, weekly_sales, inventory_level'
      }, { status: 400 })
    }

    const priceRecommendations = []
    const inventoryAlerts = []
    const alcoholSKUs: AlcoholSKU[] = []
    const competitorData: CompetitorPrice[] = []
    const marketIntelligence: any[] = []
    let totalRevenuePotential = 0
    
    console.log('🍺 Starting market-intelligent analysis...')
    
    for (const row of data) {
      const sku = row[actualColumns.sku]
      const currentPrice = parseFloat(row[actualColumns.price]?.toString().replace(/[^\d.-]/g, '')) || 0
      const weeklySales = parseFloat(row[actualColumns.weekly_sales]?.toString().replace(/[^\d.-]/g, '')) || 0
      const inventoryLevel = parseFloat(row[actualColumns.inventory_level]?.toString().replace(/[^\d.-]/g, '')) || 0
      
      if (!sku || currentPrice <= 0) {
        console.log(`Skipping invalid row: sku=${sku}, price=${currentPrice}`)
        continue
      }
      
      // Enhanced alcohol SKU conversion with market intelligence
      const alcoholSKU = convertToAlcoholSKU({
        sku,
        price: currentPrice.toString(),
        weekly_sales: weeklySales.toString(),
        inventory_level: inventoryLevel.toString(),
        ...row
      })
      alcoholSKUs.push(alcoholSKU)
      
      // Market intelligence analysis
      const productMatch = AlcoholMarketIntelligence.findBestProductMatch(sku)
      
      // Generate competitive pricing data
      let skuCompetitorPrices: CompetitorPrice[] = []
      try {
        skuCompetitorPrices = await EnhancedMockDataGenerator.generateIntelligentCompetitorPrices(
          sku,
          alcoholSKU.category || 'spirits',
          ['majestic', 'waitrose', 'tesco', 'asda']
        )
        
        // Update competitor prices with our actual price
        skuCompetitorPrices = skuCompetitorPrices.map(comp => ({
          ...comp,
          sku: sku, // Use our SKU
          our_price: currentPrice,
          price_difference: comp.competitor_price - currentPrice,
          price_difference_percentage: ((comp.competitor_price - currentPrice) / currentPrice) * 100
        }))
        
        competitorData.push(...skuCompetitorPrices)
        
        console.log(`Generated ${skuCompetitorPrices.length} competitor prices for ${sku}`)
      } catch (error) {
        console.log(`Could not generate competitor data for ${sku}:`, error)
      }
      
      // Enhanced price recommendation with competitive context
      const priceRec = calculatePriceRecommendation(
        currentPrice, 
        weeklySales, 
        inventoryLevel, 
        sku, 
        alcoholSKU, 
        skuCompetitorPrices
      )
      
      // Calculate revenue impact
      const revenueImpact = (priceRec.recommendedPrice - priceRec.currentPrice) * weeklySales * 4
      totalRevenuePotential += revenueImpact
      
      priceRecommendations.push({
        sku,
        ...priceRec,
        weeklySales,
        inventoryLevel,
        revenueImpact,
        competitorCount: skuCompetitorPrices.length,
        brandMatch: productMatch.brand?.name || 'Unknown',
        brandConfidence: productMatch.confidence
      })
      
      // Enhanced risk assessment
      const riskAssessment = assessInventoryRisk(inventoryLevel, weeklySales, sku, alcoholSKU)
      if (riskAssessment.riskType !== 'none') {
        inventoryAlerts.push(riskAssessment)
      }
      
      // Store market intelligence for insights
      if (productMatch.brand) {
        marketIntelligence.push({
          sku,
          brand: productMatch.brand,
          confidence: productMatch.confidence,
          competitivePosition: skuCompetitorPrices.length > 0 ? 
            AlcoholMarketIntelligence.analyzeCompetitivePosition(alcoholSKU, productMatch.brand, skuCompetitorPrices) : null
        })
      }
    }

    console.log(`Processed ${priceRecommendations.length} valid SKUs with market intelligence`)

    // Generate advanced market insights
    let marketInsights: any[] = []
    try {
      marketInsights = AlcoholInsightsEngine.generateMarketInsights(
        alcoholSKUs,
        competitorData,
        marketIntelligence
      )
      console.log(`Generated ${marketInsights.length} market insights`)
    } catch (insightError) {
      console.error('Market insights generation failed:', insightError)
    }

    // Sort recommendations by impact
    priceRecommendations.sort((a, b) => Math.abs(b.revenueImpact || 0) - Math.abs(a.revenueImpact || 0))
    inventoryAlerts.sort((a, b) => b.priority - a.priority)

    // Generate smart alerts
    let smartAlerts: Alert[] = []
    try {
      smartAlerts = AlertEngine.analyzeAndGenerateAlcoholAlerts(
        alcoholSKUs,
        competitorData,
        AlertEngine.getAlcoholAlertRules()
      )
    } catch (alertError) {
      console.error('Smart alert generation failed:', alertError)
    }

    // Enhanced summary with competitive intelligence
    const summary = {
      totalSKUs: priceRecommendations.length,
      priceIncreases: priceRecommendations.filter(r => r.changePercentage > 0).length,
      priceDecreases: priceRecommendations.filter(r => r.changePercentage < 0).length,
      noChange: priceRecommendations.filter(r => r.changePercentage === 0).length,
      highRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'high').length,
      mediumRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'medium').length,
      totalRevenuePotential: Math.round(totalRevenuePotential),
      
      // New competitive intelligence metrics
      brandsIdentified: marketIntelligence.filter(m => m.confidence > 0.5).length,
      competitorPricesFound: competitorData.length,
      overPricedProducts: priceRecommendations.filter(r => 
        r.competitorCount > 0 && (r as any).price_difference_percentage > 10
      ).length,
      underPricedProducts: priceRecommendations.filter(r => 
        r.competitorCount > 0 && (r as any).price_difference_percentage < -10
      ).length,
      marketInsightsGenerated: marketInsights.length
    }

    const uploadId = uuidv4()
    const now = new Date()
    
    const analysisRecord = {
      uploadId,
      fileName: file.name,
      uploadedAt: now,
      processedAt: now,
      userId,
      userEmail,
      summary,
      priceRecommendations,
      inventoryAlerts: inventoryAlerts.slice(0, 20),
      smartAlerts,
      alertsGenerated: smartAlerts.length > 0,
      
      // Enhanced data
      competitorData: competitorData.slice(0, 50), // Store top 50 competitor prices
      marketIntelligence: marketIntelligence.slice(0, 20),
      marketInsights: marketInsights.slice(0, 10),
      
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    }

    let savedId: string | null = null
    let databaseError: string | null = null
    
    try {
      savedId = await DatabaseService.saveAnalysis(analysisRecord, userId, userEmail)
      console.log(`✅ Enhanced analysis saved for user ${userEmail} with ID: ${savedId}`)
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      databaseError = dbError instanceof Error ? dbError.message : 'Database save failed'
    }

    return NextResponse.json({
      success: true,
      uploadId,
      savedToDatabase: !!savedId,
      databaseError,
      summary,
      priceRecommendations: priceRecommendations.slice(0, 20),
      inventoryAlerts: inventoryAlerts.slice(0, 10),
      smartAlerts: smartAlerts.slice(0, 5),
      alertsGenerated: smartAlerts.length,
      
      // Enhanced response data
      competitorData: competitorData.slice(0, 30),
      marketInsights: marketInsights.slice(0, 8),
      brandIntelligence: marketIntelligence.slice(0, 15),
      
      processedAt: now.toISOString(),
      userId,
      userEmail,
      columnMapping: actualColumns,
      
      debug: {
        totalRowsProcessed: data.length,
        validSKUsFound: priceRecommendations.length,
        totalRevenuePotential: summary.totalRevenuePotential,
        brandsIdentified: summary.brandsIdentified,
        competitorPricesGenerated: summary.competitorPricesFound
      }
    })

  } catch (error) {
    console.error('❌ Enhanced upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
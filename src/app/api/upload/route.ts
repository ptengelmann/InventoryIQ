// /src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parseCSVData, calculatePriceRecommendation, assessInventoryRisk, convertToAlcoholSKU } from '@/lib/utils'
import { DatabaseService } from '@/lib/models'
import { AlcoholAlertEngine as AlertEngine, Alert } from '@/lib/alert-engine'
import { AlcoholSKU } from '@/types'
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
    
    // Enhanced debug logging
    console.log('CSV Headers found:', headers)
    console.log('Sample data rows:', data.slice(0, 2))
    console.log('Total rows:', data.length)
    
    // Check for common column name variations
    const columnVariations = {
      sku: ['sku', 'product_id', 'item_id', 'code'],
      price: ['price', 'unit_price', 'cost', 'retail_price'],
      weekly_sales: ['weekly_sales', 'sales', 'units_sold', 'quantity_sold', 'weekly_units'],
      inventory_level: ['inventory_level', 'stock', 'inventory', 'stock_level', 'quantity']
    }
    
    // Find actual column names
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
    let totalRevenuePotential = 0
    
    for (const row of data) {
      // Use actual column names from mapping
      const sku = row[actualColumns.sku]
      const currentPrice = parseFloat(row[actualColumns.price]?.toString().replace(/[^\d.-]/g, '')) || 0
      const weeklySales = parseFloat(row[actualColumns.weekly_sales]?.toString().replace(/[^\d.-]/g, '')) || 0
      const inventoryLevel = parseFloat(row[actualColumns.inventory_level]?.toString().replace(/[^\d.-]/g, '')) || 0
      
      // Debug first few rows
      if (priceRecommendations.length < 3) {
        console.log(`Processing SKU ${sku}:`, {
          currentPrice,
          weeklySales,
          inventoryLevel,
          rawPrice: row[actualColumns.price],
          rawSales: row[actualColumns.weekly_sales],
          rawInventory: row[actualColumns.inventory_level]
        })
      }
      
      if (!sku || currentPrice <= 0) {
        console.log(`Skipping invalid row: sku=${sku}, price=${currentPrice}`)
        continue
      }
      
      const alcoholSKU = convertToAlcoholSKU({
        sku,
        price: currentPrice.toString(),
        weekly_sales: weeklySales.toString(),
        inventory_level: inventoryLevel.toString(),
        ...row
      })
      alcoholSKUs.push(alcoholSKU)
      
      const priceRec = calculatePriceRecommendation(currentPrice, weeklySales, inventoryLevel, sku, alcoholSKU)
      
      // Calculate revenue impact
      const revenueImpact = (priceRec.recommendedPrice - priceRec.currentPrice) * weeklySales * 4 // Monthly potential
      totalRevenuePotential += revenueImpact
      
      priceRecommendations.push({
        sku,
        ...priceRec,
        weeklySales,
        inventoryLevel,
        revenueImpact
      })
      
      const riskAssessment = assessInventoryRisk(inventoryLevel, weeklySales, sku, alcoholSKU)
      if (riskAssessment.riskType !== 'none') {
        inventoryAlerts.push(riskAssessment)
      }
    }

    console.log(`Processed ${priceRecommendations.length} valid SKUs out of ${data.length} total rows`)

    priceRecommendations.sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))
    inventoryAlerts.sort((a, b) => b.priority - a.priority)

    let smartAlerts: Alert[] = []
    try {
      smartAlerts = AlertEngine.analyzeAndGenerateAlcoholAlerts(
        alcoholSKUs,
        [],
        AlertEngine.getAlcoholAlertRules()
      )
    } catch (alertError) {
      console.error('Smart alert generation failed:', alertError)
    }

    const summary = {
      totalSKUs: priceRecommendations.length,
      priceIncreases: priceRecommendations.filter(r => r.changePercentage > 0).length,
      priceDecreases: priceRecommendations.filter(r => r.changePercentage < 0).length,
      noChange: priceRecommendations.filter(r => r.changePercentage === 0).length,
      highRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'high').length,
      mediumRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'medium').length,
      totalRevenuePotential: Math.round(totalRevenuePotential)
    }

    console.log('Final summary calculation:', {
      totalRevenuePotential: summary.totalRevenuePotential,
      priceRecommendationsCount: priceRecommendations.length,
      averageRevenuePerSKU: summary.totalRevenuePotential / priceRecommendations.length
    })

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
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    }

    let savedId: string | null = null
    let databaseError: string | null = null
    
    try {
      savedId = await DatabaseService.saveAnalysis(analysisRecord, userId, userEmail)
      console.log(`✅ Analysis saved for user ${userEmail} with ID: ${savedId}`)
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
      processedAt: now.toISOString(),
      userId,
      userEmail,
      columnMapping: actualColumns,
      debug: {
        totalRowsProcessed: data.length,
        validSKUsFound: priceRecommendations.length,
        totalRevenuePotential: summary.totalRevenuePotential
      }
    })

  } catch (error) {
    console.error('❌ Upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
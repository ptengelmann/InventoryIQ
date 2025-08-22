// FILE 1: /src/app/api/upload/route.ts - Fixed TypeScript Issues
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
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`)

    // Read the file content
    const content = await file.text()
    
    // Parse CSV data
    const { headers, data } = parseCSVData(content)
    
    // Validate required columns
    const requiredColumns = ['sku', 'price', 'weekly_sales', 'inventory_level']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        found: headers,
        required: requiredColumns
      }, { status: 400 })
    }

    console.log(`Parsed ${data.length} rows with headers:`, headers)

    // Process each row for basic recommendations
    const priceRecommendations = []
    const inventoryAlerts = []
    const alcoholSKUs: AlcoholSKU[] = []
    
    for (const row of data) {
      const sku = row.sku
      const currentPrice = parseFloat(row.price) || 0
      const weeklySales = parseFloat(row.weekly_sales) || 0
      const inventoryLevel = parseFloat(row.inventory_level) || 0
      
      // Skip invalid rows
      if (!sku || currentPrice <= 0) {
        console.log(`Skipping invalid row: ${sku}`)
        continue
      }
      
      // Convert to AlcoholSKU format
      const alcoholSKU = convertToAlcoholSKU(row)
      alcoholSKUs.push(alcoholSKU)
      
      // Calculate price recommendation
      const priceRec = calculatePriceRecommendation(currentPrice, weeklySales, inventoryLevel, sku, alcoholSKU)
      priceRecommendations.push({
        sku,
        ...priceRec,
        weeklySales,
        inventoryLevel
      })
      
      // Assess inventory risk
      const riskAssessment = assessInventoryRisk(inventoryLevel, weeklySales, sku, alcoholSKU)
      if (riskAssessment.riskType !== 'none') {
        inventoryAlerts.push(riskAssessment)
      }
    }

    console.log(`Generated ${priceRecommendations.length} price recommendations`)
    console.log(`Generated ${inventoryAlerts.length} inventory alerts`)

    // Sort recommendations by potential impact
    priceRecommendations.sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))
    
    // Sort alerts by priority (highest risk first)
    inventoryAlerts.sort((a, b) => b.priority - a.priority)

    // Generate Smart Alerts using AI Engine with proper typing
    console.log('Generating AI-powered smart alerts...')
    
    let smartAlerts: Alert[] = []
    try {
      smartAlerts = AlertEngine.analyzeAndGenerateAlcoholAlerts(
        alcoholSKUs,
        [], // No competitor data for now
        AlertEngine.getAlcoholAlertRules()
      )
      console.log(`Generated ${smartAlerts.length} smart alerts`)
    } catch (alertError) {
      console.error('Smart alert generation failed:', alertError)
      // Continue without smart alerts rather than failing entire upload
    }

    // Calculate summary stats
    const summary = {
      totalSKUs: priceRecommendations.length,
      priceIncreases: priceRecommendations.filter(r => r.changePercentage > 0).length,
      priceDecreases: priceRecommendations.filter(r => r.changePercentage < 0).length,
      noChange: priceRecommendations.filter(r => r.changePercentage === 0).length,
      highRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'high').length,
      mediumRiskSKUs: inventoryAlerts.filter(a => a.riskLevel === 'medium').length,
      totalRevenuePotential: priceRecommendations.reduce((sum, rec) => {
        const revenueDiff = (rec.recommendedPrice - rec.currentPrice) * rec.weeklySales
        return sum + revenueDiff
      }, 0)
    }

    console.log('Analysis summary:', summary)

    // Prepare analysis record for database
    const uploadId = uuidv4()
    const now = new Date()
    
    const analysisRecord = {
      uploadId,
      fileName: file.name,
      uploadedAt: now,
      processedAt: now,
      summary,
      priceRecommendations,
      inventoryAlerts: inventoryAlerts.slice(0, 20), // Limit to top 20
      smartAlerts,
      alertsGenerated: smartAlerts.length > 0,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    }

    // Save to database
    let savedId: string | null = null
    let databaseError: string | null = null
    
    try {
      console.log('Saving analysis to database...')
      savedId = await DatabaseService.saveAnalysis(analysisRecord)
      console.log(`✅ Analysis saved to database with ID: ${savedId}`)
      console.log(`📊 Generated ${smartAlerts.length} smart alerts for analysis ${uploadId}`)
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      databaseError = dbError instanceof Error ? dbError.message : 'Database save failed'
      // Continue with response even if database save fails
    }

    // Return successful response
    const response = {
      success: true,
      uploadId,
      savedToDatabase: !!savedId,
      databaseError,
      summary,
      priceRecommendations,
      inventoryAlerts: inventoryAlerts.slice(0, 10), // Show top 10 in response
      smartAlerts: smartAlerts.slice(0, 5), // Show top 5 smart alerts in response
      alertsGenerated: smartAlerts.length,
      processedAt: now.toISOString(),
      debugInfo: {
        totalRowsParsed: data.length,
        validSKUs: alcoholSKUs.length,
        smartAlertsGenerated: smartAlerts.length,
        databaseSaved: !!savedId
      }
    }

    console.log('✅ Upload processing complete:', {
      uploadId,
      skusProcessed: alcoholSKUs.length,
      alertsGenerated: smartAlerts.length,
      databaseSaved: !!savedId
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
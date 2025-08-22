// =================================================================
// 2. UPDATE: /src/app/api/upload/route.ts - Add user context
// =================================================================

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
    const userEmail = formData.get('userEmail') as string  // ✅ Get user from form
    const userId = formData.get('userId') as string  // ✅ Get user ID
    
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

    // ... rest of your existing upload processing code ...
    const content = await file.text()
    const { headers, data } = parseCSVData(content)
    
    const requiredColumns = ['sku', 'price', 'weekly_sales', 'inventory_level']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        found: headers,
        required: requiredColumns
      }, { status: 400 })
    }

    const priceRecommendations = []
    const inventoryAlerts = []
    const alcoholSKUs: AlcoholSKU[] = []
    
    for (const row of data) {
      const sku = row.sku
      const currentPrice = parseFloat(row.price) || 0
      const weeklySales = parseFloat(row.weekly_sales) || 0
      const inventoryLevel = parseFloat(row.inventory_level) || 0
      
      if (!sku || currentPrice <= 0) continue
      
      const alcoholSKU = convertToAlcoholSKU(row)
      alcoholSKUs.push(alcoholSKU)
      
      const priceRec = calculatePriceRecommendation(currentPrice, weeklySales, inventoryLevel, sku, alcoholSKU)
      priceRecommendations.push({
        sku,
        ...priceRec,
        weeklySales,
        inventoryLevel
      })
      
      const riskAssessment = assessInventoryRisk(inventoryLevel, weeklySales, sku, alcoholSKU)
      if (riskAssessment.riskType !== 'none') {
        inventoryAlerts.push(riskAssessment)
      }
    }

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
      totalRevenuePotential: priceRecommendations.reduce((sum, rec) => {
        const revenueDiff = (rec.recommendedPrice - rec.currentPrice) * rec.weeklySales
        return sum + revenueDiff
      }, 0)
    }

    const uploadId = uuidv4()
    const now = new Date()
    
   const analysisRecord = {
  uploadId,
  fileName: file.name,
  uploadedAt: now,
  processedAt: now,
  userId,        // ✅ Add this
  userEmail,     // ✅ Add this
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
      // ✅ Pass user info to database
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
      priceRecommendations,
      inventoryAlerts: inventoryAlerts.slice(0, 10),
      smartAlerts: smartAlerts.slice(0, 5),
      alertsGenerated: smartAlerts.length,
      processedAt: now.toISOString(),
      userId,  // ✅ Return user context
      userEmail
    })

  } catch (error) {
    console.error('❌ Upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
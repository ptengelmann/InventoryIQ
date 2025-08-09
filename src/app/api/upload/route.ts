import { NextRequest, NextResponse } from 'next/server'
import { parseCSVData, calculatePriceRecommendation, assessInventoryRisk } from '@/lib/utils'
import { DatabaseService } from '@/lib/models'
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

    // Process each row
    const priceRecommendations = []
    const inventoryAlerts = []
    
    for (const row of data) {
      const sku = row.sku
      const currentPrice = parseFloat(row.price) || 0
      const weeklySales = parseFloat(row.weekly_sales) || 0
      const inventoryLevel = parseFloat(row.inventory_level) || 0
      
      // Skip invalid rows
      if (!sku || currentPrice <= 0) continue
      
      // Calculate price recommendation
      const priceRec = calculatePriceRecommendation(currentPrice, weeklySales, inventoryLevel)
      priceRecommendations.push({
        sku,
        ...priceRec,
        weeklySales,
        inventoryLevel
      })
      
      // Assess inventory risk
      const riskAssessment = assessInventoryRisk(inventoryLevel, weeklySales, sku)
      if (riskAssessment.riskType !== 'none') {
        inventoryAlerts.push(riskAssessment)
      }
    }

    // Sort recommendations by potential impact
    priceRecommendations.sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))
    
    // Sort alerts by priority (highest risk first)
    inventoryAlerts.sort((a, b) => b.priority - a.priority)

    // Get top 5 alerts
    const topAlerts = inventoryAlerts.slice(0, 5)

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
      inventoryAlerts: topAlerts,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    }

    // Save to database (but don't let database errors break the response)
    let savedId: string | null = null
    try {
      savedId = await DatabaseService.saveAnalysis(analysisRecord)
      console.log('Analysis saved to database with ID:', savedId)
    } catch (dbError) {
      console.error('Database save failed, but continuing with response:', dbError)
      // We'll still return the analysis even if database save fails
    }

    return NextResponse.json({
      success: true,
      uploadId,
      savedToDatabase: !!savedId,
      summary,
      priceRecommendations,
      inventoryAlerts: topAlerts,
      processedAt: now.toISOString()
    })

  } catch (error) {
    console.error('Upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
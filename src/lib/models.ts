// Database schema types for InventoryIQ

export interface AnalysisRecord {
  _id?: string
  uploadId: string
  fileName: string
  uploadedAt: Date
  processedAt: Date
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    noChange: number
    highRiskSKUs: number
    mediumRiskSKUs: number
    totalRevenuePotential: number
  }
  priceRecommendations: {
    sku: string
    currentPrice: number
    recommendedPrice: number
    changePercentage: number
    reason: string
    weeklySales: number
    inventoryLevel: number
  }[]
  inventoryAlerts: {
    sku: string
    riskLevel: 'low' | 'medium' | 'high'
    riskType: 'stockout' | 'overstock' | 'none'
    weeksOfStock: number
    priority: number
    message: string
  }[]
  userAgent?: string
  ipAddress?: string
}

export interface SKUHistory {
  _id?: string
  sku: string
  analyses: {
    analysisId: string
    date: Date
    price: number
    recommendedPrice: number
    weeklySales: number
    inventoryLevel: number
    changePercentage: number
  }[]
  createdAt: Date
  updatedAt: Date
}

// Database service functions
import clientPromise from './mongodb'

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db('InventoryIQ')
  }

  // Save analysis to database
  static async saveAnalysis(analysis: Omit<AnalysisRecord, '_id'>): Promise<string> {
    try {
      const db = await this.getDb()
      const result = await db.collection('analyses').insertOne(analysis)
      
      // Also update SKU history
      await this.updateSKUHistory(analysis)
      
      return result.insertedId.toString()
    } catch (error) {
      console.error('Error saving analysis:', error)
      throw new Error('Failed to save analysis')
    }
  }

  // Update SKU history for trend tracking
  private static async updateSKUHistory(analysis: AnalysisRecord) {
    try {
      const db = await this.getDb()
      const collection = db.collection('sku_history')
      
      for (const rec of analysis.priceRecommendations) {
        const historyEntry = {
          analysisId: analysis.uploadId,
          date: analysis.processedAt,
          price: rec.currentPrice,
          recommendedPrice: rec.recommendedPrice,
          weeklySales: rec.weeklySales,
          inventoryLevel: rec.inventoryLevel,
          changePercentage: rec.changePercentage
        }

        await collection.updateOne(
          { sku: rec.sku },
          {
            $push: { analyses: historyEntry },
            $set: { updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        )
      }
    } catch (error) {
      console.error('Error updating SKU history:', error)
      // Don't throw here - we don't want to fail the main analysis
    }
  }

  // Get recent analyses
  static async getRecentAnalyses(limit: number = 10): Promise<AnalysisRecord[]> {
    try {
      const db = await this.getDb()
      const analyses = await db.collection('analyses')
        .find({})
        .sort({ processedAt: -1 })
        .limit(limit)
        .toArray()
      
      return analyses.map(doc => ({
        ...doc,
        _id: doc._id.toString()
      })) as AnalysisRecord[]
    } catch (error) {
      console.error('Error fetching analyses:', error)
      return []
    }
  }

  // Get SKU performance history
  static async getSKUHistory(sku: string): Promise<SKUHistory | null> {
    try {
      const db = await this.getDb()
      const history = await db.collection('sku_history').findOne({ sku })
      
      if (!history) return null
      
      return {
        ...history,
        _id: history._id.toString()
      } as SKUHistory
    } catch (error) {
      console.error('Error fetching SKU history:', error)
      return null
    }
  }

  // Get dashboard stats
  static async getDashboardStats() {
    try {
      const db = await this.getDb()
      
      const totalAnalyses = await db.collection('analyses').countDocuments()
      const totalSKUs = await db.collection('sku_history').countDocuments()
      
      // Get recent performance
      const recentAnalyses = await db.collection('analyses')
        .find({})
        .sort({ processedAt: -1 })
        .limit(30)
        .toArray()
      
      const totalRevenuePotential = recentAnalyses.reduce((sum, analysis) => 
        sum + (analysis.summary?.totalRevenuePotential || 0), 0
      )
      
      const avgSKUsPerAnalysis = recentAnalyses.length > 0 
        ? recentAnalyses.reduce((sum, analysis) => sum + (analysis.summary?.totalSKUs || 0), 0) / recentAnalyses.length
        : 0

      return {
        totalAnalyses,
        totalSKUs,
        totalRevenuePotential: Math.round(totalRevenuePotential),
        avgSKUsPerAnalysis: Math.round(avgSKUsPerAnalysis),
        recentAnalyses: recentAnalyses.length
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalAnalyses: 0,
        totalSKUs: 0,
        totalRevenuePotential: 0,
        avgSKUsPerAnalysis: 0,
        recentAnalyses: 0
      }
    }
  }
}
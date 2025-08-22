// 1. UPDATE: /src/lib/models.ts - Add user isolation
import { Alert } from './alert-engine'
import clientPromise from './mongodb'

export interface AnalysisRecord {
  _id?: string
  uploadId: string
  fileName: string
  uploadedAt: Date
  processedAt: Date
  userId: string  // ✅ NEW: User isolation
  userEmail: string  // ✅ NEW: User identification
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
    riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'none'
    weeksOfStock: number
    priority: number
    message: string
    aiEnhanced?: boolean
    alcoholContext?: {
      category?: string
      shelfLifeDays?: number
      seasonalPeak?: string
    }
  }[]
  smartAlerts: Alert[]
  alertsGenerated: boolean
  userAgent?: string
  ipAddress?: string
}

export interface SKUHistory {
  _id?: string
  sku: string
  userId: string  // ✅ NEW: User isolation
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

export class DatabaseService {
  private static async getDb() {
    const client = await clientPromise
    return client.db('InventoryIQ')
  }

  // Save analysis to database with user isolation
  static async saveAnalysis(analysis: Omit<AnalysisRecord, '_id'>, userId: string, userEmail: string): Promise<string> {
    try {
      const db = await this.getDb()
      
      // Add user identification to analysis
      const analysisWithUser = {
        ...analysis,
        userId,
        userEmail
      }
      
      const result = await db.collection('analyses').insertOne(analysisWithUser)
      
      // Also update SKU history with user isolation
      await this.updateSKUHistory(analysisWithUser as AnalysisRecord)
      
      return result.insertedId.toString()
    } catch (error) {
      console.error('Error saving analysis:', error)
      throw new Error('Failed to save analysis')
    }
  }

  // Update SKU history for trend tracking with user isolation
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
          { sku: rec.sku, userId: analysis.userId },  // ✅ Filter by user
          {
            $push: { 
              analyses: historyEntry
            } as any,
            $set: { updatedAt: new Date() },
            $setOnInsert: { 
              createdAt: new Date(),
              userId: analysis.userId  // ✅ Set user ID
            }
          },
          { upsert: true }
        )
      }
    } catch (error) {
      console.error('Error updating SKU history:', error)
    }
  }

  // Get recent analyses for specific user
  static async getRecentAnalyses(userId: string, limit: number = 10): Promise<AnalysisRecord[]> {
    try {
      const db = await this.getDb()
      const analyses = await db.collection('analyses')
        .find({ userId })  // ✅ Filter by user
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

  // Get specific analysis by ID and user
  static async getAnalysisById(analysisId: string, userId: string): Promise<AnalysisRecord | null> {
    try {
      const db = await this.getDb()
      const analysis = await db.collection('analyses').findOne({ 
        uploadId: analysisId,
        userId  // ✅ Ensure user owns this analysis
      })
      
      if (!analysis) return null
      
      return {
        ...analysis,
        _id: analysis._id.toString()
      } as AnalysisRecord
    } catch (error) {
      console.error('Error fetching analysis:', error)
      return null
    }
  }

  // Update alert status with user validation
  static async updateAlertStatus(
    analysisId: string, 
    alertId: string, 
    status: 'acknowledged' | 'resolved' | 'snoozed',
    userId: string  // ✅ User validation
  ): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      let updateDoc: any = {}
      
      if (status === 'resolved') {
        updateDoc = { 
          'smartAlerts.$.acknowledged': true, 
          'smartAlerts.$.resolved': true,
          'smartAlerts.$.resolvedAt': new Date()
        }
      } else if (status === 'acknowledged') {
        updateDoc = { 
          'smartAlerts.$.acknowledged': true,
          'smartAlerts.$.acknowledgedAt': new Date()
        }
      } else if (status === 'snoozed') {
        updateDoc = { 
          'smartAlerts.$.snoozed': true,
          'smartAlerts.$.snoozedAt': new Date(),
          'smartAlerts.$.snoozeUntil': new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
      
      const result = await db.collection('analyses').updateOne(
        { 
          uploadId: analysisId, 
          'smartAlerts.id': alertId,
          userId  // ✅ Ensure user owns this analysis
        },
        { $set: updateDoc }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error updating alert status:', error)
      return false
    }
  }

  // Delete specific alert with user validation
  static async deleteAlert(analysisId: string, alertId: string, userId: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      const result = await db.collection('analyses').updateOne(
        { uploadId: analysisId, userId },  // ✅ User validation
        { $pull: { smartAlerts: { id: alertId } } as any }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error deleting alert:', error)
      return false
    }
  }

  // Delete entire analysis with user validation
  static async deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      // Also delete from SKU history
      await db.collection('sku_history').updateMany(
        { userId },  // ✅ Only user's SKU history
        { $pull: { analyses: { analysisId: analysisId } } as any }
      )
      
      const result = await db.collection('analyses').deleteOne({ 
        uploadId: analysisId,
        userId  // ✅ User validation
      })
      
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting analysis:', error)
      return false
    }
  }

  // Get alerts for specific analysis and user
  static async getAlertsForAnalysis(analysisId: string, userId: string): Promise<Alert[]> {
    try {
      const analysis = await this.getAnalysisById(analysisId, userId)
      return analysis?.smartAlerts || []
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  // Get latest alerts for specific user
  static async getLatestAlerts(userId: string): Promise<Alert[]> {
    try {
      const recentAnalyses = await this.getRecentAnalyses(userId, 1)
      if (recentAnalyses.length === 0) return []
      
      return recentAnalyses[0].smartAlerts || []
    } catch (error) {
      console.error('Error fetching latest alerts:', error)
      return []
    }
  }

  // Get SKU performance history for specific user
  static async getSKUHistory(sku: string, userId: string): Promise<SKUHistory | null> {
    try {
      const db = await this.getDb()
      const history = await db.collection('sku_history').findOne({ 
        sku, 
        userId  // ✅ User-specific SKU history
      })
      
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

  // Get alert statistics for specific user
  static async getAlertStatistics(userId: string) {
    try {
      const db = await this.getDb()
      const analyses = await db.collection('analyses')
        .find({ userId })  // ✅ User-specific alerts
        .toArray()
      
      let totalAlerts = 0
      let criticalAlerts = 0
      let unreadAlerts = 0
      let resolvedAlerts = 0
      
      analyses.forEach((analysis: any) => {
        if (analysis.smartAlerts) {
          totalAlerts += analysis.smartAlerts.length
          criticalAlerts += analysis.smartAlerts.filter((a: any) => a.severity === 'critical').length
          unreadAlerts += analysis.smartAlerts.filter((a: any) => !a.acknowledged && !a.resolved).length
          resolvedAlerts += analysis.smartAlerts.filter((a: any) => a.resolved).length
        }
      })
      
      return {
        totalAlerts,
        criticalAlerts,
        unreadAlerts,
        resolvedAlerts,
        acknowledgementRate: totalAlerts > 0 ? ((totalAlerts - unreadAlerts) / totalAlerts * 100) : 0,
        resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts * 100) : 0
      }
    } catch (error) {
      console.error('Error fetching alert statistics:', error)
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        unreadAlerts: 0,
        resolvedAlerts: 0,
        acknowledgementRate: 0,
        resolutionRate: 0
      }
    }
  }

  // Get dashboard stats for specific user
  static async getDashboardStats(userId: string) {
    try {
      const db = await this.getDb()
      
      const totalAnalyses = await db.collection('analyses').countDocuments({ userId })
      const totalSKUs = await db.collection('sku_history').countDocuments({ userId })
      
      // Get recent performance for this user
      const recentAnalyses = await db.collection('analyses')
        .find({ userId })  // ✅ User-specific stats
        .sort({ processedAt: -1 })
        .limit(30)
        .toArray()
      
      const totalRevenuePotential = recentAnalyses.reduce((sum: number, analysis: any) => 
        sum + (analysis.summary?.totalRevenuePotential || 0), 0
      )
      
      const avgSKUsPerAnalysis = recentAnalyses.length > 0 
        ? recentAnalyses.reduce((sum: number, analysis: any) => sum + (analysis.summary?.totalSKUs || 0), 0) / recentAnalyses.length
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

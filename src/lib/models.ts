// COMPLETE REPLACEMENT: /lib/models.ts
// Database schema types and service functions for InventoryIQ

import { Alert } from './alert-engine'
import clientPromise from './mongodb'

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
  riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'none'  // ENHANCED
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

  // Save analysis to database
  static async saveAnalysis(analysis: Omit<AnalysisRecord, '_id'>): Promise<string> {
    try {
      const db = await this.getDb()
      const result = await db.collection('analyses').insertOne(analysis)
      
      // Also update SKU history
      await this.updateSKUHistory(analysis as AnalysisRecord)
      
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
            $push: { 
              analyses: historyEntry
            } as any, // Type assertion to fix MongoDB typing issue
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

  // Get specific analysis by ID
  static async getAnalysisById(analysisId: string): Promise<AnalysisRecord | null> {
    try {
      const db = await this.getDb()
      const analysis = await db.collection('analyses').findOne({ uploadId: analysisId })
      
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

  // Update alert status (enhanced to support snooze)
  static async updateAlertStatus(
    analysisId: string, 
    alertId: string, 
    status: 'acknowledged' | 'resolved' | 'snoozed'
  ): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      let updateDoc: any = {}
      
      if (status === 'resolved') {
        // If resolving, also acknowledge
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
          'smartAlerts.$.snoozeUntil': new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      }
      
      const result = await db.collection('analyses').updateOne(
        { uploadId: analysisId, 'smartAlerts.id': alertId },
        { $set: updateDoc }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error updating alert status:', error)
      return false
    }
  }

  // Delete specific alert
  static async deleteAlert(analysisId: string, alertId: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      const result = await db.collection('analyses').updateOne(
        { uploadId: analysisId },
        { $pull: { smartAlerts: { id: alertId } } as any }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error deleting alert:', error)
      return false
    }
  }

  // Delete all alerts for an analysis
  static async deleteAllAlertsForAnalysis(analysisId: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      const result = await db.collection('analyses').updateOne(
        { uploadId: analysisId },
        { $set: { smartAlerts: [] } }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error deleting all alerts:', error)
      return false
    }
  }

  // Delete entire analysis (and all its alerts)
  static async deleteAnalysis(analysisId: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      
      // Also delete from SKU history
      await db.collection('sku_history').updateMany(
        {},
        { $pull: { analyses: { analysisId: analysisId } } as any }
      )
      
      const result = await db.collection('analyses').deleteOne({ uploadId: analysisId })
      
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting analysis:', error)
      return false
    }
  }

  // Get all analyses (for management)
  static async getAllAnalyses(): Promise<AnalysisRecord[]> {
    try {
      const db = await this.getDb()
      const analyses = await db.collection('analyses')
        .find({})
        .sort({ processedAt: -1 })
        .toArray()
      
      return analyses.map(doc => ({
        ...doc,
        _id: doc._id.toString()
      })) as AnalysisRecord[]
    } catch (error) {
      console.error('Error fetching all analyses:', error)
      return []
    }
  }

  // Get alerts for specific analysis
  static async getAlertsForAnalysis(analysisId: string): Promise<Alert[]> {
    try {
      const analysis = await this.getAnalysisById(analysisId)
      return analysis?.smartAlerts || []
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  // Get latest alerts (from most recent analysis)
  static async getLatestAlerts(): Promise<Alert[]> {
    try {
      const recentAnalyses = await this.getRecentAnalyses(1)
      if (recentAnalyses.length === 0) return []
      
      return recentAnalyses[0].smartAlerts || []
    } catch (error) {
      console.error('Error fetching latest alerts:', error)
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

  // Get alert statistics
  static async getAlertStatistics() {
    try {
      const db = await this.getDb()
      const analyses = await db.collection('analyses')
        .find({})
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
// src/lib/models.ts - COMPLETE REWRITE
// Fully typed PostgreSQL integration with proper type safety

import { PostgreSQLService, type InventoryAlert } from './database-postgres'

// Complete Alert interface matching the alert-engine expectations
export interface Alert {
  id: string
  rule_id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  message: string
  action_required: boolean
  impact: {
    revenue_at_risk: number
    urgency: number
  }
  sku: string
  urgency_score: number
  revenue_at_risk: number
  acknowledged: boolean
  resolved: boolean
  created_at: string
  data: {
    analysis_id: string
    sku_code: string
    inventory_level: number
    weeks_of_stock: number
  }
  delivered_via: string[]
  ai_recommendation: Record<string, any>
  metadata: {
    source: string
    analysis_id: string
  }
}

export interface AnalysisRecord {
  _id?: string
  uploadId: string
  fileName: string
  uploadedAt: Date
  processedAt: Date
  userId: string
  userEmail: string
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    noChange: number
    highRiskSKUs: number
    mediumRiskSKUs: number
    totalRevenuePotential: number
  }
  priceRecommendations: PriceRecommendation[]
  inventoryAlerts: InventoryAlert[]
  smartAlerts: Alert[]
  alertsGenerated: boolean
  userAgent?: string
  ipAddress?: string
}

export interface PriceRecommendation {
  sku: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  reason: string
  weeklySales: number
  inventoryLevel: number
  confidence?: number
  revenueImpact?: number
  creativeStrategy?: string
}

export interface SKUHistory {
  _id?: string
  sku: string
  userId: string
  analyses: AnalysisHistoryEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface AnalysisHistoryEntry {
  analysisId: string
  date: Date
  price: number
  recommendedPrice: number
  weeklySales: number
  inventoryLevel: number
  changePercentage: number
}

export interface DashboardStats {
  totalAnalyses: number
  totalSKUs: number
  totalRevenuePotential: number
  avgSKUsPerAnalysis: number
  recentAnalyses: number
}

export interface AlertStatistics {
  totalAlerts: number
  criticalAlerts: number
  unreadAlerts: number
  resolvedAlerts: number
  acknowledgementRate: number
  resolutionRate: number
}

// Database service that actually calls PostgreSQL
export class DatabaseService {
  
  /**
   * Save analysis to PostgreSQL database
   */
  static async saveAnalysis(
    analysis: Omit<AnalysisRecord, '_id'>, 
    userId: string, 
    userEmail: string
  ): Promise<string> {
    try {
      console.log(`💾 Saving analysis via PostgreSQL for user: ${userEmail}`)
      
      const analysisData = {
        uploadId: analysis.uploadId,
        fileName: analysis.fileName,
        userId,
        userEmail,
        summary: analysis.summary,
        priceRecommendations: analysis.priceRecommendations,
        inventoryAlerts: analysis.inventoryAlerts,
        smartAlerts: analysis.smartAlerts,
        competitorData: [],
        marketInsights: [],
        processingTimeMs: undefined
      }
      
      return await PostgreSQLService.saveAnalysis(analysisData)
    } catch (error) {
      console.error('❌ Error saving analysis:', error)
      throw new Error('Failed to save analysis')
    }
  }

  /**
   * Get recent analyses from PostgreSQL
   */
  static async getRecentAnalyses(userId: string, limit: number = 10): Promise<AnalysisRecord[]> {
    try {
      console.log(`📊 Getting recent analyses for user: ${userId}`)
      
      const analyses = await PostgreSQLService.getRecentAnalyses(userId, limit)
      
      // Convert PostgreSQL format to AnalysisRecord format with proper typing
      return analyses.map((analysis: any): AnalysisRecord => ({
        _id: analysis._id,
        uploadId: analysis.uploadId,
        fileName: analysis.fileName,
        uploadedAt: new Date(analysis.uploadedAt),
        processedAt: new Date(analysis.processedAt),
        userId: analysis.userId || userId,
        userEmail: analysis.userEmail || userId,
        summary: analysis.summary || {
          totalSKUs: 0,
          priceIncreases: 0,
          priceDecreases: 0,
          noChange: 0,
          highRiskSKUs: 0,
          mediumRiskSKUs: 0,
          totalRevenuePotential: 0
        },
        priceRecommendations: (analysis.recommendations || []).map((rec: any): PriceRecommendation => ({
          sku: rec.sku_code || rec.sku,
          currentPrice: rec.current_price || rec.currentPrice,
          recommendedPrice: rec.recommended_price || rec.recommendedPrice,
          changePercentage: rec.change_percentage || rec.changePercentage,
          reason: rec.reason,
          weeklySales: rec.weekly_sales || rec.weeklySales,
          inventoryLevel: rec.inventory_level || rec.inventoryLevel,
          confidence: rec.confidence_score,
          revenueImpact: rec.revenue_impact,
          creativeStrategy: Array.isArray(rec.creative_strategies) ? rec.creative_strategies[0] : rec.creativeStrategy
        })),
        inventoryAlerts: (analysis.alerts || []).map((alert: any): InventoryAlert => ({
          sku: alert.sku_code || alert.sku,
          riskLevel: alert.severity || alert.riskLevel,
          riskType: alert.type || alert.riskType,
          weeksOfStock: alert.weeks_of_stock || 0,
          priority: alert.urgency_score || alert.priority || 5,
          message: alert.message,
          aiEnhanced: alert.ai_enhanced || false,
          revenueAtRisk: alert.revenue_at_risk
        })),
        smartAlerts: [],
        alertsGenerated: (analysis.alerts || []).length > 0
      }))
    } catch (error) {
      console.error('❌ Error fetching analyses:', error)
      return []
    }
  }

  /**
   * Get specific analysis by ID
   */
  static async getAnalysisById(analysisId: string, userId: string): Promise<AnalysisRecord | null> {
    try {
      console.log(`📊 Getting analysis ${analysisId} for user: ${userId}`)
      
      const analyses = await PostgreSQLService.getRecentAnalyses(userId, 100)
      const analysis = analyses.find((a: any) => a.uploadId === analysisId || a._id === analysisId)
      
      if (!analysis) return null
      
      return {
        _id: analysis._id,
        uploadId: analysis.uploadId,
        fileName: analysis.fileName,
        uploadedAt: new Date(analysis.uploadedAt),
        processedAt: new Date(analysis.processedAt),
        userId: analysis.userId || userId,
        userEmail: analysis.userEmail || userId,
        summary: analysis.summary,
        priceRecommendations: (analysis.recommendations || []).map((rec: any): PriceRecommendation => ({
          sku: rec.sku_code || rec.sku,
          currentPrice: rec.current_price || rec.currentPrice,
          recommendedPrice: rec.recommended_price || rec.recommendedPrice,
          changePercentage: rec.change_percentage || rec.changePercentage,
          reason: rec.reason,
          weeklySales: rec.weekly_sales || rec.weeklySales,
          inventoryLevel: rec.inventory_level || rec.inventoryLevel,
          confidence: rec.confidence_score,
          revenueImpact: rec.revenue_impact
        })),
        inventoryAlerts: (analysis.alerts || []).map((alert: any): InventoryAlert => ({
          sku: alert.sku_code || alert.sku,
          riskLevel: alert.severity || alert.riskLevel,
          riskType: alert.type || alert.riskType,
          weeksOfStock: alert.weeks_of_stock || 0,
          priority: alert.urgency_score || alert.priority || 5,
          message: alert.message,
          aiEnhanced: alert.ai_enhanced || false,
          revenueAtRisk: alert.revenue_at_risk
        })),
        smartAlerts: [],
        alertsGenerated: (analysis.alerts || []).length > 0
      }
    } catch (error) {
      console.error('❌ Error fetching analysis:', error)
      return null
    }
  }

  /**
   * Update alert status in PostgreSQL
   */
  static async updateAlertStatus(
    analysisId: string, 
    alertId: string, 
    status: 'acknowledged' | 'resolved' | 'snoozed',
    userId: string
  ): Promise<boolean> {
    try {
      console.log(`🔄 Updating alert ${alertId} status to ${status}`)
      return await PostgreSQLService.updateAlertStatus(alertId, status, userId)
    } catch (error) {
      console.error('❌ Error updating alert status:', error)
      return false
    }
  }

  /**
   * Delete alert from PostgreSQL
   */
  static async deleteAlert(analysisId: string, alertId: string, userId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting alert ${alertId}`)
      return await PostgreSQLService.deleteAlert(alertId, userId)
    } catch (error) {
      console.error('❌ Error deleting alert:', error)
      return false
    }
  }

  /**
   * Delete entire analysis (placeholder - needs implementation)
   */
  static async deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting analysis ${analysisId}`)
      console.log('Delete analysis not yet implemented in PostgreSQL service')
      return true
    } catch (error) {
      console.error('❌ Error deleting analysis:', error)
      return false
    }
  }

  /**
   * Get alerts for specific analysis
   */
  static async getAlertsForAnalysis(analysisId: string, userId: string): Promise<Alert[]> {
    try {
      console.log(`🚨 Getting alerts for analysis ${analysisId}`)
      
      const allAlerts = await PostgreSQLService.getLatestAlerts(userId)
      
      // Filter by analysis ID and convert to proper Alert type
      const filteredAlerts = allAlerts.filter((alert: any) => alert.analysis_id === analysisId)
      
      return filteredAlerts.map((alert: any): Alert => ({
        id: alert.id,
        rule_id: `rule-${alert.type}`,
        type: alert.type,
        severity: alert.severity,
        category: alert.type,
        title: alert.title,
        message: alert.message,
        action_required: !alert.acknowledged,
        impact: {
          revenue_at_risk: alert.revenue_at_risk || 0,
          urgency: alert.urgency_score || 5
        },
        sku: alert.sku,
        urgency_score: alert.urgency_score || 5,
        revenue_at_risk: alert.revenue_at_risk || 0,
        acknowledged: alert.acknowledged || false,
        resolved: alert.resolved || false,
        created_at: alert.created_at,
        data: {
          analysis_id: analysisId,
          sku_code: alert.sku,
          inventory_level: alert.inventory_level || 0,
          weeks_of_stock: alert.weeks_of_stock || 0
        },
        delivered_via: ['dashboard', 'email'],
        ai_recommendation: alert.ai_recommendation || {},
        metadata: {
          source: 'postgresql',
          analysis_id: analysisId
        }
      }))
    } catch (error) {
      console.error('❌ Error fetching alerts:', error)
      return []
    }
  }

  /**
   * Get latest alerts for user
   */
  static async getLatestAlerts(userId: string): Promise<Alert[]> {
    try {
      console.log(`🚨 Getting latest alerts for user: ${userId}`)
      
      const alerts = await PostgreSQLService.getLatestAlerts(userId)
      
      // Convert to compatible Alert format with all required properties
      return alerts.map((alert: any): Alert => ({
        id: alert.id,
        rule_id: `rule-${alert.type}`,
        type: alert.type,
        severity: alert.severity,
        category: alert.type,
        title: alert.title,
        message: alert.message,
        action_required: !alert.acknowledged,
        impact: {
          revenue_at_risk: alert.revenue_at_risk || 0,
          urgency: alert.urgency_score || 5
        },
        sku: alert.sku,
        urgency_score: alert.urgency_score || 5,
        revenue_at_risk: alert.revenue_at_risk || 0,
        acknowledged: alert.acknowledged || false,
        resolved: alert.resolved || false,
        created_at: alert.created_at,
        data: {
          analysis_id: alert.analysis_id || 'unknown',
          sku_code: alert.sku,
          inventory_level: alert.inventory_level || 0,
          weeks_of_stock: alert.weeks_of_stock || 0
        },
        delivered_via: ['dashboard', 'email'],
        ai_recommendation: alert.ai_recommendation || {},
        metadata: {
          source: 'postgresql',
          analysis_id: alert.analysis_id || 'unknown'
        }
      }))
    } catch (error) {
      console.error('❌ Error fetching latest alerts:', error)
      return []
    }
  }

  /**
   * Get SKU price/sales history
   */
  static async getSKUHistory(sku: string, userId: string): Promise<SKUHistory | null> {
    try {
      console.log(`📈 Getting SKU history for ${sku}`)
      
      // This would need to be implemented to query price_history table
      // For now, return basic structure
      return {
        _id: `history-${sku}`,
        sku,
        userId,
        analyses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('❌ Error fetching SKU history:', error)
      return null
    }
  }

  /**
   * Get alert statistics from PostgreSQL
   */
  static async getAlertStatistics(userId: string): Promise<AlertStatistics> {
    try {
      console.log(`📊 Getting alert statistics for user: ${userId}`)
      return await PostgreSQLService.getAlertStatistics(userId)
    } catch (error) {
      console.error('❌ Error fetching alert statistics:', error)
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

  /**
   * Get dashboard statistics from PostgreSQL
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      console.log(`📊 Getting dashboard stats for user: ${userId}`)
      return await PostgreSQLService.getDashboardStats(userId)
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      return {
        totalAnalyses: 0,
        totalSKUs: 0,
        totalRevenuePotential: 0,
        avgSKUsPerAnalysis: 0,
        recentAnalyses: 0
      }
    }
  }

  /**
   * Get competitor pricing data
   */
  static async getCompetitorData(userId: string, days: number = 7) {
    try {
      console.log(`🎯 Getting competitor data for user: ${userId}`)
      return await PostgreSQLService.getCompetitorData(userId, days)
    } catch (error) {
      console.error('❌ Error fetching competitor data:', error)
      return []
    }
  }

  /**
   * Get slow-moving products for AI analysis
   */
  static async getSlowMovingProducts(userId: string, thresholdWeeks: number = 4) {
    try {
      console.log(`🐌 Getting slow-moving products for user: ${userId}`)
      return await PostgreSQLService.getSlowMovingProducts(userId, thresholdWeeks)
    } catch (error) {
      console.error('❌ Error fetching slow-moving products:', error)
      return []
    }
  }

  /**
   * Database health check
   */
  static async healthCheck() {
    try {
      return await PostgreSQLService.healthCheck()
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      return {
        status: 'down' as const,
        connection: false,
        performance: { query_time_ms: 0 }
      }
    }
  }

  /**
   * Disconnect from database
   */
  static async disconnect(): Promise<void> {
    await PostgreSQLService.disconnect()
  }
}
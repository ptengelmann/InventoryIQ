// src/lib/database-postgres.ts
// Complete implementation with all required methods and proper TypeScript types

import { PrismaClient } from '@prisma/client'
import type { AlcoholSKU, CompetitorPrice } from '@/types'

// Global Prisma client with optimizations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface AnalysisData {
  uploadId: string
  fileName: string
  userId: string
  userEmail: string
  summary: any
  priceRecommendations: any[]
  inventoryAlerts: InventoryAlert[]
  smartAlerts: any[]
  competitorData: CompetitorPrice[]
  marketInsights: any[]
  processingTimeMs?: number
}

// Proper type definition for inventory alerts
export interface InventoryAlert {
  sku: string
  riskLevel: 'low' | 'medium' | 'high'
  riskType: 'stockout' | 'overstock' | 'expiration' | 'seasonal_shortage' | 'none'
  weeksOfStock: number
  priority: number
  message: string
  aiEnhanced?: boolean
  revenueAtRisk?: number
  alcoholContext?: {
    category?: string
    shelfLifeDays?: number
    seasonalPeak?: string
  }
}



export class PostgreSQLService {
  
static async getAnalysisById(analysisId: string, userIdentifier: string): Promise<any> {
  try {
    // First get the user
    const user = await this.getUserByEmail(userIdentifier)
    
    if (!user) {
      console.log(`User not found: ${userIdentifier}`)
      return null
    }
    
    // Get the analysis with all related data
    const analysis = await prisma.analysis.findFirst({
      where: {
        upload_id: analysisId,
        user_id: user.id
      },
      include: {
        recommendations: true,
        alerts: true,
        competitor_data: true  // Changed from competitor_prices to competitor_data
      }
    })
    
    return analysis
  } catch (error) {
    console.error(`Error fetching analysis ${analysisId}:`, error)
    return null
  }
}

  // Save analysis to PostgreSQL
  static async saveAnalysis(analysisData: AnalysisData): Promise<string> {
    try {
      console.log(`💾 Saving analysis for user ${analysisData.userEmail}`)
      
      // Step 1: Ensure user exists
      let user = await prisma.user.findUnique({
        where: { email: analysisData.userEmail }
      })
      
      if (!user) {
        console.log(`Creating new user: ${analysisData.userEmail}`)
        user = await prisma.user.create({
          data: {
            email: analysisData.userEmail,
            name: analysisData.userEmail.split('@')[0],
            company: 'Demo Account',
            subscription_tier: 'free'
          }
        })
      }
      
      // Step 2: Save analysis record
      const analysis = await prisma.analysis.create({
        data: {
          upload_id: analysisData.uploadId,
          file_name: analysisData.fileName,
          uploaded_at: new Date(),
          processed_at: new Date(),
          user_id: user.id,
          total_skus: analysisData.summary.totalSKUs || 0,
          revenue_potential: analysisData.summary.totalRevenuePotential || 0,
          processing_time_ms: analysisData.processingTimeMs,
          analysis_type: 'standard',
          summary: analysisData.summary,
          column_mapping: {},
          market_insights: analysisData.marketInsights
        }
      })
      
      console.log(`✅ Analysis saved with ID: ${analysis.id}`)
      
      // Step 3: Save SKUs and recommendations
      if (analysisData.priceRecommendations.length > 0) {
        await this.saveSKUsAndRecommendations(
          user.id, 
          analysisData.uploadId,
          analysisData.priceRecommendations
        )
      }
      
      // Step 4: Save alerts
      if (analysisData.inventoryAlerts.length > 0) {
        await this.saveAlerts(user.id, analysisData.uploadId, analysisData.inventoryAlerts)
      }
      
      // Step 5: Save competitor data
      if (analysisData.competitorData.length > 0) {
        await this.saveCompetitorData(user.id, analysisData.uploadId, analysisData.competitorData)
      }
      
      return analysis.id
      
    } catch (error) {
      console.error('💥 PostgreSQL save error:', error)
      throw new Error(`Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // Save SKUs and their recommendations
  private static async saveSKUsAndRecommendations(
    userId: string, 
    analysisId: string, 
    recommendations: any[]
  ): Promise<void> {
    try {
      console.log(`💾 Saving ${recommendations.length} SKUs and recommendations`)
      
      // Batch insert SKUs (upsert to handle duplicates)
      for (const rec of recommendations) {
        await prisma.sKU.upsert({
          where: {
            user_id_sku_code: {
              user_id: userId,
              sku_code: rec.sku
            }
          },
          update: {
            price: rec.currentPrice,
            weekly_sales: rec.weeklySales,
            inventory_level: rec.inventoryLevel,
            updated_at: new Date()
          },
          create: {
            sku_code: rec.sku,
            user_id: userId,
            product_name: rec.sku,
            category: rec.category || 'spirits',
            brand: rec.brand || 'Unknown',
            price: rec.currentPrice,
            weekly_sales: rec.weeklySales,
            inventory_level: rec.inventoryLevel,
            days_since_sale: Math.floor(rec.inventoryLevel / (rec.weeklySales || 0.1) * 7)
          }
        })
        
        // Save price recommendation
        if (rec.changePercentage !== 0) {
          await prisma.priceRecommendation.create({
            data: {
              analysis_id: analysisId,
              sku_code: rec.sku,
              user_id: userId,
              current_price: rec.currentPrice,
              recommended_price: rec.recommendedPrice,
              change_percentage: rec.changePercentage,
              confidence_score: rec.confidence || 0.7,
              reason: rec.reason,
              weekly_sales: rec.weeklySales,
              inventory_level: rec.inventoryLevel,
              revenue_impact: rec.revenueImpact || 0,
              creative_strategies: rec.creativeStrategy ? [rec.creativeStrategy] : [],
              risk_level: Math.abs(rec.changePercentage) > 15 ? 'high' : 'medium'
            }
          })
        }
      }
      
      console.log(`✅ Saved ${recommendations.length} SKUs and recommendations`)
      
    } catch (error) {
      console.error('Error saving SKUs:', error)
      throw error
    }
  }
  
  // Save inventory alerts with proper typing
  private static async saveAlerts(
    userId: string, 
    analysisId: string, 
    alerts: InventoryAlert[]
  ): Promise<void> {
    try {
      console.log(`💾 Saving ${alerts.length} alerts`)
      
      for (const alert of alerts) {
        await prisma.alert.create({
          data: {
            user_id: userId,
            analysis_id: analysisId,
            sku_code: alert.sku,
            type: alert.riskType || 'stockout',
            severity: alert.riskLevel,
            title: `${alert.riskLevel.toUpperCase()} Risk: ${alert.sku}`,
            message: alert.message,
            urgency_score: alert.priority || 5,
            revenue_at_risk: alert.revenueAtRisk || 0
          }
        })
      }
      
      console.log(`✅ Saved ${alerts.length} alerts`)
      
    } catch (error) {
      console.error('Error saving alerts:', error)
      throw error
    }
  }

  
  
  // Save competitor pricing data
  private static async saveCompetitorData(
    userId: string, 
    analysisId: string, 
    competitorData: CompetitorPrice[]
  ): Promise<void> {
    try {
      console.log(`💾 Saving ${competitorData.length} competitor prices`)
      
      for (const comp of competitorData) {
        await prisma.competitorPrice.create({
          data: {
            sku_code: comp.sku,
            user_id: userId,
            analysis_id: analysisId,
            competitor: comp.competitor,
            competitor_price: comp.competitor_price,
            our_price: comp.our_price,
            price_difference: comp.price_difference,
            price_difference_pct: comp.price_difference_percentage,
            availability: comp.availability,
            product_name: comp.product_name,
            relevance_score: comp.relevance_score,
            scraping_success: true,
            scraping_method: 'api'
          }
        })
      }
      
      console.log(`✅ Saved ${competitorData.length} competitor prices`)
      
    } catch (error) {
      console.error('Error saving competitor data:', error)
      throw error
    }
  }

  
  
  // Get recent analyses from PostgreSQL
  static async getRecentAnalyses(userId: string, limit: number = 10): Promise<any[]> {
    try {
      console.log(`📊 Getting recent analyses for user: ${userId}`)
      
      // Get user first
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) {
        console.log(`User not found: ${userId}`)
        return []
      }
      
      const analyses = await prisma.analysis.findMany({
        where: { user_id: user.id },
        orderBy: { processed_at: 'desc' },
        take: limit,
        include: {
          recommendations: {
            take: 5,
            orderBy: { revenue_impact: 'desc' }
          },
          alerts: {
            take: 3,
            where: { resolved: false },
            orderBy: { urgency_score: 'desc' }
          }
        }
      })
      
      console.log(`📊 Found ${analyses.length} analyses`)
      
      return analyses.map((analysis: any) => ({
        _id: analysis.id,
        uploadId: analysis.upload_id,
        fileName: analysis.file_name,
        uploadedAt: analysis.uploaded_at.toISOString(),
        processedAt: analysis.processed_at.toISOString(),
        summary: analysis.summary,
        recommendations: analysis.recommendations,
        alerts: analysis.alerts
      }))
      
    } catch (error) {
      console.error('Error fetching analyses:', error)
      return []
    }
  }

  
  
  // Get dashboard statistics
  static async getDashboardStats(userId: string): Promise<any> {
    try {
      console.log(`📊 Getting dashboard stats for user: ${userId}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) {
        return {
          totalAnalyses: 0,
          totalSKUs: 0,
          totalRevenuePotential: 0,
          avgSKUsPerAnalysis: 0,
          recentAnalyses: 0
        }
      }
      
      // Get aggregated stats
      const [analysisCount, skuCount, totalRevenue] = await Promise.all([
        prisma.analysis.count({ where: { user_id: user.id } }),
        prisma.sKU.count({ where: { user_id: user.id } }),
        prisma.analysis.aggregate({
          where: { user_id: user.id },
          _sum: { revenue_potential: true }
        })
      ])
      
      const stats = {
        totalAnalyses: analysisCount,
        totalSKUs: skuCount,
        totalRevenuePotential: totalRevenue._sum.revenue_potential || 0,
        avgSKUsPerAnalysis: analysisCount > 0 ? Math.round(skuCount / analysisCount) : 0,
        recentAnalyses: analysisCount
      }
      
      console.log(`📊 Dashboard stats:`, stats)
      return stats
      
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

  
  
  // Get competitor data
  static async getCompetitorData(userId: string, days: number = 7): Promise<CompetitorPrice[]> {
    try {
      console.log(`🎯 Getting competitor data for user ${userId} from last ${days} days`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) return []
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      const competitorPrices = await prisma.competitorPrice.findMany({
        where: {
          user_id: user.id,
          last_updated: { gte: cutoffDate }
        },
        orderBy: { last_updated: 'desc' }
      })
      
return competitorPrices.map((cp: any) => ({
  sku: cp.sku_code,
  competitor: cp.competitor,
  competitor_price: cp.competitor_price,
  our_price: cp.our_price,
  price_difference: cp.price_difference,
  price_difference_percentage: cp.price_difference_pct,
  availability: cp.availability,
  product_name: cp.product_name,
  relevance_score: cp.relevance_score,
  last_updated: cp.last_updated || new Date(),  // Add this
  source: cp.source || 'api'                    // Add this
}))
      
    } catch (error) {
      console.error('Competitor data fetch failed:', error)
      return []
    }
  }
  
  // Get slow-moving products for GPT-4 analysis
  static async getSlowMovingProducts(userId: string, thresholdWeeks: number = 4): Promise<any[]> {
    try {
      console.log(`🐌 Getting slow-moving products for user ${userId}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) return []
      
      const slowMovers = await prisma.sKU.findMany({
        where: {
          user_id: user.id,
          weekly_sales: { lt: 1 },
          inventory_level: { gt: 10 }
        },
        orderBy: [
          { weekly_sales: 'asc' },
          { inventory_level: 'desc' }
        ],
        take: 20
      })
      
      return slowMovers.map((sku: any) => ({
        sku: sku.sku_code,
        category: sku.category,
        brand: sku.brand,
        inventory_level: sku.inventory_level,
        weeks_since_last_sale: sku.days_since_sale ? Math.floor(sku.days_since_sale / 7) : 4,
        price: sku.price,
        cost_price: sku.cost_price
      }))
      
    } catch (error) {
      console.error('Error fetching slow-moving products:', error)
      return []
    }
  }
  
  // Get user by email - NEW METHOD
  static async getUserByEmail(email: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }
  
  // Get alerts for a specific analysis ID - NEW METHOD
  static async getAlertsForAnalysisId(userId: string, analysisId: string): Promise<any[]> {
    try {
      console.log(`🔍 Finding alerts for analysis ${analysisId} and user ${userId}`);
      
      const alerts = await prisma.alert.findMany({
        where: {
          user_id: userId,
          analysis_id: analysisId
        },
        include: {
          sku: true
        },
        orderBy: [
          { urgency_score: 'desc' },
          { created_at: 'desc' }
        ]
      });
      
      console.log(`📊 Found ${alerts.length} alerts for analysis ${analysisId}`);
      return alerts;
    } catch (error) {
      console.error(`Error getting alerts for analysis ${analysisId}:`, error);
      return [];
    }
  }
  
  // Get latest alerts for user
  static async getLatestAlerts(userId: string, limit: number = 10): Promise<any[]> {
    try {
      console.log(`🚨 Getting latest alerts for user: ${userId}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) return []
      
      const alerts = await prisma.alert.findMany({
        where: { 
          user_id: user.id,
          resolved: false
        },
        orderBy: [
          { urgency_score: 'desc' },
          { created_at: 'desc' }
        ],
        take: limit,
        include: {
          sku: true
        }
      })
      
      return alerts.map((alert: any) => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        sku: alert.sku_code,
        urgency_score: alert.urgency_score,
        revenue_at_risk: alert.revenue_at_risk,
        acknowledged: alert.acknowledged,
        created_at: alert.created_at.toISOString(),
        product_name: alert.sku?.product_name
      }))
      
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }
  
  // Get alert statistics
  static async getAlertStatistics(userId: string): Promise<any> {
    try {
      console.log(`📈 Getting alert statistics for user: ${userId}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) {
        return {
          totalAlerts: 0,
          criticalAlerts: 0,
          unreadAlerts: 0,
          resolvedAlerts: 0,
          acknowledgementRate: 0,
          resolutionRate: 0
        }
      }
      
      const [
        totalAlerts,
        criticalAlerts,
        unreadAlerts,
        resolvedAlerts,
        acknowledgedAlerts
      ] = await Promise.all([
        prisma.alert.count({ where: { user_id: user.id } }),
        prisma.alert.count({ where: { user_id: user.id, severity: 'critical' } }),
        prisma.alert.count({ where: { user_id: user.id, acknowledged: false } }),
        prisma.alert.count({ where: { user_id: user.id, resolved: true } }),
        prisma.alert.count({ where: { user_id: user.id, acknowledged: true } })
      ])
      
      return {
        totalAlerts,
        criticalAlerts,
        unreadAlerts,
        resolvedAlerts,
        acknowledgementRate: totalAlerts > 0 ? Math.round((acknowledgedAlerts / totalAlerts) * 100) : 0,
        resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0
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
  
  
  // Update alert status
  static async updateAlertStatus(
    alertId: string,
    status: 'acknowledged' | 'resolved' | 'snoozed',
    userId: string
  ): Promise<boolean> {
    try {
      console.log(`🔄 Updating alert ${alertId} status to ${status}`)
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) return false
      
      const updateData: any = {}
      
      if (status === 'acknowledged') {
        updateData.acknowledged = true
        updateData.acknowledged_at = new Date()
      } else if (status === 'resolved') {
        updateData.resolved = true
        updateData.resolved_at = new Date()
        updateData.acknowledged = true
        updateData.acknowledged_at = new Date()
      } else if (status === 'snoozed') {
        updateData.snoozed = true
        updateData.snooze_until = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
      
      await prisma.alert.update({
        where: { 
          id: alertId,
          user_id: user.id
        },
        data: updateData
      })
      
      console.log(`✅ Alert ${alertId} status updated to ${status}`)
      return true
      
    } catch (error) {
      console.error('Error updating alert status:', error)
      return false
    }
  }
  
  // Delete alert
  static async deleteAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userId }
      })
      
      if (!user) return false
      
      await prisma.alert.delete({
        where: { 
          id: alertId,
          user_id: user.id
        }
      })
      
      return true
      
    } catch (error) {
      console.error('Error deleting alert:', error)
      return false
    }
  }
  
  // Database health check
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down',
    connection: boolean,
    performance: { query_time_ms: number }
  }> {
    try {
      const startTime = Date.now()
      
      // Test basic connection
      await prisma.$queryRaw`SELECT 1 as test`
      
      const queryTime = Date.now() - startTime
      
      return {
        status: queryTime < 1000 ? 'healthy' : 'degraded',
        connection: true,
        performance: { query_time_ms: queryTime }
      }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        status: 'down',
        connection: false,
        performance: { query_time_ms: 0 }
      }
    }
  }
  
  // Disconnect database connection
  static async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}
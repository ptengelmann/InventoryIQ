// Create this file: src/app/api/monitoring/route.ts
// Simple real-time monitoring API that works with your existing database

import { NextRequest, NextResponse } from 'next/server'
import { RealCompetitiveScraping } from '@/lib/real-competitive-scraping'
import { PostgreSQLService } from '@/lib/database-postgres'

interface MonitoringRequest {
  userId: string
  products: {
    sku: string
    product: string
    category: string
    currentPrice: number
  }[]
  intervalMinutes?: number
  maxRetailersPerCheck?: number
}

// Start monitoring for a user's products
export async function POST(request: NextRequest) {
  try {
    const { userId, products, intervalMinutes = 60, maxRetailersPerCheck = 3 }: MonitoringRequest = await request.json()
    
    if (!userId || !products || products.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid monitoring request - userId and products required' 
      }, { status: 400 })
    }

    console.log(`Starting monitoring for ${products.length} products for user ${userId}`)
    
    // Start real-time monitoring using the enhanced scraping system
    await RealCompetitiveScraping.startRealTimeMonitoring(
      products.map(p => ({
        product: p.product,
        category: p.category,
        sku: p.sku
      })),
      intervalMinutes,
      maxRetailersPerCheck
    )

    // Save monitoring configuration to database
    await PostgreSQLService.saveMonitoringConfig(userId, {
      products: products.map(p => p.sku),
      intervalMinutes,
      maxRetailersPerCheck,
      startedAt: new Date(),
      isActive: true
    })

    return NextResponse.json({
      success: true,
      message: `Real-time monitoring started for ${products.length} products`,
      config: {
        productsCount: products.length,
        intervalMinutes,
        maxRetailersPerCheck,
        totalRetailersAvailable: 17
      },
      startedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Monitoring start error:', error)
    return NextResponse.json({
      error: 'Failed to start monitoring',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get monitoring status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID required' 
      }, { status: 400 })
    }

    const status = RealCompetitiveScraping.getMonitoringStatus()
    const dbConfig = await PostgreSQLService.getMonitoringConfig(userId)

    return NextResponse.json({
      success: true,
      status: {
        isActive: status.isMonitoring,
        activeProducts: status.activeProducts,
        totalRetailers: status.totalRetailers,
        lastCheck: new Date().toISOString(),
        config: dbConfig
      }
    })

  } catch (error) {
    console.error('Monitoring status error:', error)
    return NextResponse.json({
      error: 'Failed to get monitoring status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Stop monitoring
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID required' 
      }, { status: 400 })
    }

    // Stop the monitoring
    RealCompetitiveScraping.stopRealTimeMonitoring()
    
    // Update database
    await PostgreSQLService.updateMonitoringConfig(userId, { isActive: false })

    return NextResponse.json({
      success: true,
      message: 'Real-time monitoring stopped'
    })

  } catch (error) {
    console.error('Monitoring stop error:', error)
    return NextResponse.json({
      error: 'Failed to stop monitoring',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
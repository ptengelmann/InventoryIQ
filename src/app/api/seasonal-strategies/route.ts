// src/app/api/seasonal-strategies/route.ts
// New API endpoint to test and debug seasonal strategies

import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const analysisId = searchParams.get('analysisId')
    const action = searchParams.get('action') || 'get'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    console.log(`🎯 Seasonal strategies API called: action=${action}, userId=${userId}, analysisId=${analysisId}`)

    switch (action) {
      case 'get':
        if (!analysisId) {
          return NextResponse.json({ error: 'Analysis ID required for get action' }, { status: 400 })
        }
        
        const strategies = await PostgreSQLService.getSeasonalStrategies(userId, analysisId)
        
        return NextResponse.json({
          success: true,
          strategies,
          count: strategies.length,
          message: `Found ${strategies.length} seasonal strategies`,
          debug: {
            userId,
            analysisId,
            timestamp: new Date().toISOString()
          }
        })

      case 'test':
        // Test seasonal strategy generation and saving
        const testStrategies = [
          {
            type: 'mystery_box',
            title: 'Test Christmas Mystery Box',
            description: 'Test seasonal strategy for Christmas season',
            reasoning: 'Testing seasonal recommendations engine',
            seasonal_trigger: 'Christmas season test',
            estimated_revenue_impact: 1500,
            urgency: 'high',
            implementation_timeline: '2 weeks',
            marketing_angle: 'Test premium surprise for alcohol enthusiasts',
            target_customer: 'Test customers aged 25-55',
            products_involved: ['TEST-SKU-001', 'TEST-SKU-002'],
            execution_steps: ['Step 1: Test packaging', 'Step 2: Test marketing', 'Step 3: Test launch'],
            success_metrics: ['Test metric 1', 'Test metric 2'],
            risk_factors: ['Test risk 1', 'Test risk 2'],
            pricing_strategy: { bundle_price: 75, discount_percentage: 25 }
          }
        ]

        if (analysisId) {
          await PostgreSQLService.saveSeasonalStrategies(userId, analysisId, testStrategies)
          
          // Verify by retrieving
          const savedStrategies = await PostgreSQLService.getSeasonalStrategies(userId, analysisId)
          
          return NextResponse.json({
            success: true,
            message: 'Test seasonal strategy saved and retrieved successfully',
            testStrategies,
            savedStrategies,
            count: savedStrategies.length,
            debug: {
              userId,
              analysisId,
              saveSuccess: savedStrategies.length > 0,
              timestamp: new Date().toISOString()
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Analysis ID required for test action'
          }, { status: 400 })
        }

      case 'debug':
        // Debug mode - show all seasonal strategies for user
        try {
          const user = await PostgreSQLService.getUserByEmail(userId)
          if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
          }

          // Get all seasonal strategies for this user
          const { prisma } = await import('@/lib/database-postgres')
          const allStrategies = await prisma.seasonalStrategy.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
            take: 50
          })

          // Get recent analyses
          const recentAnalyses = await PostgreSQLService.getRecentAnalyses(userId, 10)

          return NextResponse.json({
            success: true,
            debug: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name
              },
              seasonalStrategies: {
                total: allStrategies.length,
                byAnalysis: allStrategies.reduce((acc: Record<string, number>, strategy: any) => {
                  const analysisId = strategy.analysis_id
                  if (!acc[analysisId]) acc[analysisId] = 0
                  acc[analysisId]++
                  return acc
                }, {} as Record<string, number>),
                latest: allStrategies.slice(0, 5).map((s: any) => ({
                  id: s.id,
                  analysis_id: s.analysis_id,
                  type: s.type,
                  title: s.title,
                  created_at: s.created_at
                }))
              },
              recentAnalyses: recentAnalyses.map(a => ({
                uploadId: a.uploadId,
                fileName: a.fileName,
                processedAt: a.processedAt,
                totalSKUs: a.summary?.totalSKUs
              }))
            },
            timestamp: new Date().toISOString()
          })

        } catch (debugError) {
          console.error('Debug error:', debugError)
          return NextResponse.json({
            error: 'Debug failed',
            details: debugError instanceof Error ? debugError.message : 'Unknown error'
          }, { status: 500 })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Seasonal strategies API error:', error)
    return NextResponse.json({
      error: 'Failed to process seasonal strategies request',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint to manually trigger seasonal strategy generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, analysisId, alcoholSKUs, forceRegenerate = false } = body

    if (!userId || !analysisId) {
      return NextResponse.json({ error: 'userId and analysisId required' }, { status: 400 })
    }

    if (!Array.isArray(alcoholSKUs) || alcoholSKUs.length === 0) {
      return NextResponse.json({ error: 'alcoholSKUs array required' }, { status: 400 })
    }

    console.log(`🎯 Manual seasonal strategy generation requested for ${alcoholSKUs.length} SKUs`)

    // Import the seasonal engine
    const { EnhancedSeasonalRecommendations } = await import('@/lib/enhanced-seasonal-recommendations')

    // Generate seasonal recommendations
    const seasonalStrategies = await EnhancedSeasonalRecommendations.generateContextualRecommendations(
      alcoholSKUs,
      [],
      userId
    )

    if (seasonalStrategies.length > 0) {
      // Save to database
      await PostgreSQLService.saveSeasonalStrategies(userId, analysisId, seasonalStrategies)
      
      // Verify saving worked
      const savedStrategies = await PostgreSQLService.getSeasonalStrategies(userId, analysisId)
      
      return NextResponse.json({
        success: true,
        message: `Generated and saved ${seasonalStrategies.length} seasonal strategies`,
        generated: seasonalStrategies,
        saved: savedStrategies,
        counts: {
          generated: seasonalStrategies.length,
          saved: savedStrategies.length,
          match: seasonalStrategies.length === savedStrategies.length
        },
        debug: {
          userId,
          analysisId,
          skuCount: alcoholSKUs.length,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No seasonal strategies generated',
        debug: {
          userId,
          analysisId,
          skuCount: alcoholSKUs.length,
          reasons: [
            'Insufficient slow-moving inventory',
            'No upcoming seasonal opportunities',
            'SKU data may not meet seasonal criteria'
          ]
        }
      })
    }

  } catch (error) {
    console.error('Manual seasonal generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate seasonal strategies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
// src/app/api/analytics/performance/route.ts
// API endpoint for action performance analytics and impact tracking

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log(`📊 Fetching action analytics for user: ${userId}`)

    // Try to fetch actions - if table doesn't exist yet, return empty data
    let actions: any[] = []

    try {
      actions = await prisma.action.findMany({
        where: { user_id: userId },
        orderBy: { initiated_at: 'desc' },
        take: 100, // Limit to recent 100 actions
        select: {
          id: true,
          action_type: true,
          target_sku: true,
          status: true,
          expected_impact: true,
          actual_impact: true,
          confidence_score: true,
          initiated_at: true,
          completed_at: true
        }
      })
    } catch (dbError) {
      console.warn('Actions table not fully migrated yet:', dbError)
      // Return empty data structure - table will be created when first action is executed
      actions = []
    }

    console.log(`Found ${actions.length} actions`)

    // Calculate summary statistics
    const stats = {
      total_actions: actions.length,
      completed_actions: actions.filter(a => a.status === 'completed').length,
      pending_actions: actions.filter(a => a.status === 'pending' || a.status === 'executing').length,
      failed_actions: actions.filter(a => a.status === 'failed').length,
      total_expected_impact: actions.reduce((sum, a) => sum + (a.expected_impact || 0), 0),
      total_actual_impact: actions
        .filter(a => a.actual_impact !== null)
        .reduce((sum, a) => sum + (a.actual_impact || 0), 0),
      success_rate: actions.filter(a => a.status === 'completed').length > 0
        ? (actions.filter(a => a.status === 'completed' && (a.actual_impact || 0) >= (a.expected_impact || 0)).length /
           actions.filter(a => a.status === 'completed').length) * 100
        : 0,
      avg_confidence: actions.length > 0
        ? actions.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / actions.length
        : 0
    }

    // Calculate breakdown by action type
    const actionTypes = ['price_update', 'reorder_stock', 'launch_campaign', 'bulk_update']
    const breakdown = actionTypes.map(type => {
      const typeActions = actions.filter(a => a.action_type === type)

      return {
        action_type: type,
        count: typeActions.length,
        expected_impact: typeActions.reduce((sum, a) => sum + (a.expected_impact || 0), 0),
        actual_impact: typeActions
          .filter(a => a.actual_impact !== null)
          .reduce((sum, a) => sum + (a.actual_impact || 0), 0),
        success_rate: typeActions.filter(a => a.status === 'completed').length > 0
          ? (typeActions.filter(a => a.status === 'completed' && (a.actual_impact || 0) >= (a.expected_impact || 0)).length /
             typeActions.filter(a => a.status === 'completed').length) * 100
          : 0
      }
    }).filter(item => item.count > 0) // Only include types with actions

    // Format recent actions for display
    const recent_actions = actions.slice(0, 20).map(action => ({
      id: action.id,
      action_type: action.action_type,
      target_sku: action.target_sku || 'Multiple SKUs',
      status: action.status,
      expected_impact: action.expected_impact || 0,
      actual_impact: action.actual_impact,
      confidence_score: action.confidence_score || 0,
      initiated_at: action.initiated_at,
      completed_at: action.completed_at
    }))

    // Calculate accuracy over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActions = actions.filter(a =>
      a.initiated_at >= thirtyDaysAgo &&
      a.status === 'completed' &&
      a.actual_impact !== null
    )

    const accuracy_trend = []
    for (let i = 0; i < 30; i += 7) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (30 - i))
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - (30 - i - 7))

      const weekActions = recentActions.filter(a =>
        a.initiated_at >= weekStart && a.initiated_at < weekEnd
      )

      if (weekActions.length > 0) {
        const weekExpected = weekActions.reduce((sum, a) => sum + (a.expected_impact || 0), 0)
        const weekActual = weekActions.reduce((sum, a) => sum + (a.actual_impact || 0), 0)

        accuracy_trend.push({
          week: `Week ${Math.floor(i / 7) + 1}`,
          accuracy: weekExpected > 0 ? Math.round((weekActual / weekExpected) * 100) : 0,
          actions: weekActions.length
        })
      }
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      stats,
      breakdown,
      recent_actions,
      accuracy_trend
    })

  } catch (error) {
    console.error('Action analytics error:', error)
    await prisma.$disconnect()

    return NextResponse.json(
      {
        error: 'Failed to fetch action analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

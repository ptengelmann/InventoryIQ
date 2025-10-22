// src/app/api/actions/execute/route.ts
// ENTERPRISE-GRADE ACTION EXECUTION API
// Handles all user actions with validation, audit trails, and rollback capability

import { NextRequest, NextResponse } from 'next/server'
import { ActionEngine, ActionPayload } from '@/lib/action-engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/actions/execute
 * Execute a validated action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body as { action: ActionPayload; userId: string }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    if (!action || !action.type) {
      return NextResponse.json(
        { error: 'Invalid action payload' },
        { status: 400 }
      )
    }

    console.log(`🎯 Executing action: ${action.type} for user ${userId}`)

    // Execute action through Action Engine
    const result = await ActionEngine.executeAction(action, userId, userId)

    if (!result.success) {
      // Check if requires approval
      if (result.data?.requires_approval) {
        return NextResponse.json({
          status: 'requires_approval',
          action_id: result.action_id,
          approval_details: result.data,
          message: result.message
        }, { status: 202 }) // 202 Accepted but pending approval
      }

      // Validation or execution error
      return NextResponse.json({
        success: false,
        error: result.message,
        details: result.errors,
        action_id: result.action_id
      }, { status: 400 })
    }

    // Success
    return NextResponse.json({
      success: true,
      action_id: result.action_id,
      message: result.message,
      data: result.data,
      actual_impact: result.actual_impact
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Action execution error:', error)
    return NextResponse.json({
      success: false,
      error: 'Action execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/actions/execute
 * Get recent actions for user (for real-time tracker)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // This would fetch from database - simplified for now
    return NextResponse.json({
      actions: []
    })

  } catch (error) {
    console.error('Error fetching actions:', error)
    return NextResponse.json({
      error: 'Failed to fetch actions'
    }, { status: 500 })
  }
}

// src/app/api/actions/rollback/route.ts
// Rollback action endpoint

import { NextRequest, NextResponse } from 'next/server'
import { ActionEngine } from '@/lib/action-engine'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { actionId, userId, reason } = body

    if (!userId || !actionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await ActionEngine.rollbackAction(
      actionId,
      userId,
      reason || 'User requested rollback'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error('Rollback error:', error)
    return NextResponse.json({
      error: 'Rollback failed'
    }, { status: 500 })
  }
}

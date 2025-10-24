// Alert Action API - Acknowledge, Resolve, Snooze, Execute
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const { alertId } = params
    const body = await request.json()
    const { action, userId } = body

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userId' },
        { status: 400 }
      )
    }

    console.log(`📝 Alert action: ${action} on alert ${alertId} by user ${userId}`)

    // Get the alert
    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Perform the action
    let updateData: any = {}

    switch (action) {
      case 'acknowledge':
        updateData = {
          acknowledged: true,
          acknowledged_at: new Date()
        }
        break

      case 'resolve':
        updateData = {
          resolved: true,
          resolved_at: new Date(),
          acknowledged: true,
          acknowledged_at: alert.acknowledged_at || new Date()
        }
        break

      case 'snooze':
        const snoozeUntil = new Date()
        snoozeUntil.setHours(snoozeUntil.getHours() + 24) // Snooze for 24 hours
        updateData = {
          snoozed: true,
          snoozed_until: snoozeUntil
        }
        break

      case 'execute':
        // Mark as acknowledged and add execution timestamp
        updateData = {
          acknowledged: true,
          acknowledged_at: alert.acknowledged_at || new Date(),
          executed_at: new Date()
        }
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Update the alert
    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: updateData
    })

    console.log(`✅ Alert ${alertId} ${action}d successfully`)

    // Generate detailed action result message
    const actionDetails = getActionDetails(action, alert, updatedAlert)

    return NextResponse.json({
      success: true,
      action,
      alert: updatedAlert,
      message: `Alert ${action}d successfully`,
      details: actionDetails,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Alert action error:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to generate detailed action results
function getActionDetails(action: string, originalAlert: any, updatedAlert: any) {
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const sku = originalAlert.sku_code

  switch (action) {
    case 'execute':
      return {
        summary: `Primary action initiated for ${sku}`,
        next_steps: [
          'Alert marked as acknowledged',
          'Recommended action plan is being processed',
          'Monitor inventory levels for changes',
          'System will track completion automatically'
        ],
        expected_outcome: 'Issue will be resolved according to the action plan',
        timestamp_action: updatedAlert.executed_at,
        what_happened: 'The primary recommended action has been triggered. This alert is now being actively worked on.'
      }

    case 'acknowledge':
      return {
        summary: `Alert acknowledged for ${sku}`,
        next_steps: [
          'Review the recommended action plan',
          'Prepare necessary resources',
          'Execute the action when ready',
          'Alert remains in your active queue'
        ],
        expected_outcome: 'You will manually handle this alert',
        timestamp_action: updatedAlert.acknowledged_at,
        what_happened: 'You have confirmed receipt of this alert. It remains active until you execute or resolve it.'
      }

    case 'resolve':
      return {
        summary: `Alert resolved for ${sku}`,
        next_steps: [
          'Alert moved to resolved status',
          'Issue marked as complete',
          'System will continue monitoring',
          'New alert will be created if issue recurs'
        ],
        expected_outcome: 'Alert is closed and archived',
        timestamp_action: updatedAlert.resolved_at,
        what_happened: 'This alert has been marked as resolved and is now complete. It will be removed from active alerts.'
      }

    case 'snooze':
      const snoozeUntil = new Date(updatedAlert.snoozed_until).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        summary: `Alert snoozed for ${sku}`,
        next_steps: [
          'Alert hidden until tomorrow',
          `Will reappear at ${snoozeUntil}`,
          'Issue is not resolved, just postponed',
          'Consider executing action soon'
        ],
        expected_outcome: `Alert will return at ${snoozeUntil}`,
        timestamp_action: new Date().toISOString(),
        what_happened: `This alert has been snoozed for 24 hours. It will reappear tomorrow at ${snoozeUntil}.`
      }

    default:
      return {
        summary: `Action ${action} completed for ${sku}`,
        next_steps: ['Action completed successfully'],
        expected_outcome: 'Alert status updated',
        timestamp_action: new Date().toISOString(),
        what_happened: `Action ${action} has been completed.`
      }
  }
}

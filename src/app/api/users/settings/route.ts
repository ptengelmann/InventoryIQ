// src/app/api/users/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database-postgres'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      email_alerts, 
      alert_frequency, 
      competitive_monitoring,
      stock_alert_threshold,
      price_change_threshold 
    } = body

    if (!email) {
      return NextResponse.json({
        error: 'Email is required'
      }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Upsert user settings (create or update)
    const settings = await prisma.userSettings.upsert({
      where: { user_id: user.id },
      update: {
        email_alerts: email_alerts ?? true,
        alert_frequency: alert_frequency ?? 'immediate',
        competitive_monitoring: competitive_monitoring ?? true,
        stock_alert_threshold: stock_alert_threshold ?? 2,
        price_change_threshold: price_change_threshold ?? 10.0
      },
      create: {
        user_id: user.id,
        email_alerts: email_alerts ?? true,
        alert_frequency: alert_frequency ?? 'immediate',
        competitive_monitoring: competitive_monitoring ?? true,
        stock_alert_threshold: stock_alert_threshold ?? 2,
        price_change_threshold: price_change_threshold ?? 10.0
      }
    })

    return NextResponse.json({
      success: true,
      settings: {
        email_alerts: settings.email_alerts,
        alert_frequency: settings.alert_frequency,
        competitive_monitoring: settings.competitive_monitoring,
        stock_alert_threshold: settings.stock_alert_threshold,
        price_change_threshold: settings.price_change_threshold
      }
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    // Get user with settings
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        user_settings: true
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Return settings or defaults if none exist
    const settings = user.user_settings || {
      email_alerts: true,
      alert_frequency: 'immediate',
      competitive_monitoring: true,
      stock_alert_threshold: 2,
      price_change_threshold: 10.0
    }

    return NextResponse.json({
      success: true,
      settings: {
        email_alerts: settings.email_alerts,
        alert_frequency: settings.alert_frequency,
        competitive_monitoring: settings.competitive_monitoring,
        stock_alert_threshold: settings.stock_alert_threshold,
        price_change_threshold: settings.price_change_threshold
      }
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}
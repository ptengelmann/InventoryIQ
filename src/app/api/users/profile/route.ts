// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database-postgres'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, company, phone, location } = body

    if (!email) {
      return NextResponse.json({
        error: 'Email is required'
      }, { status: 400 })
    }

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name: name || existingUser.name,
        company: company || existingUser.company,
        phone: phone || existingUser.phone,
        location: location || existingUser.location,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        phone: updatedUser.phone,
        location: updatedUser.location
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({
      error: 'Failed to update profile'
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

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        location: user.location
      },
      settings: user.user_settings ? {
        email_alerts: user.user_settings.email_alerts,
        alert_frequency: user.user_settings.alert_frequency,
        competitive_monitoring: user.user_settings.competitive_monitoring,
        stock_alert_threshold: user.user_settings.stock_alert_threshold,
        price_change_threshold: user.user_settings.price_change_threshold
      } : null
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}
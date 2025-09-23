// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database-postgres'
import { sendResetPasswordEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, token, newPassword } = body

    if (action === 'request') {
      // Step 1: Request password reset
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Check if user exists
      console.log('🔍 Looking up user with email:', email.toLowerCase())
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
      
      console.log('👤 User found:', !!user)
      if (user) {
        console.log('📧 User email from DB:', user.email)
        console.log('🆔 User ID:', user.id)
      }

      if (!user) {
        console.log('❌ No user found - returning generic message')
        // Don't reveal if user exists or not for security
        return NextResponse.json(
          { message: 'If an account with that email exists, a password reset link has been sent.' },
          { status: 200 }
        )
      }

      console.log('🎯 User exists - proceeding with reset token generation')

      // Generate secure reset token
      console.log('🔐 Generating reset token...')
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      console.log('🔑 Reset token generated:', resetToken.substring(0, 8) + '...')

      // Save token to database using the PROPER fields
      console.log('💾 Updating user in database...')
      await prisma.user.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expires: resetTokenExpiry,
          updated_at: new Date()
        }
      })
      console.log('✅ Database updated successfully')

      // Send reset email
      console.log('📬 About to send reset email to:', email)
      await sendResetPasswordEmail(email, resetToken)
      console.log('✅ Email sent successfully!')

      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      )

    } else if (action === 'reset') {
      // Step 2: Reset password with token
      if (!token || !newPassword) {
        return NextResponse.json(
          { error: 'Token and new password are required' },
          { status: 400 }
        )
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      // Find user with valid token using PROPER fields
      const user = await prisma.user.findFirst({
        where: {
          reset_token: token,
          reset_token_expires: {
            gt: new Date() // Token must not be expired
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_token: null, // Clear the token
          reset_token_expires: null, // Clear the expiry
          updated_at: new Date()
        }
      })

      return NextResponse.json(
        { message: 'Password successfully reset. You can now sign in with your new password.' },
        { status: 200 }
      )

    } else if (action === 'verify') {
      // Step 3: Verify token (optional - for checking if reset link is valid)
      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' },
          { status: 400 }
        )
      }

      // Find user with valid token using PROPER fields
      const user = await prisma.user.findFirst({
        where: {
          reset_token: token,
          reset_token_expires: {
            gt: new Date() // Token must not be expired
          }
        },
        select: {
          email: true, // Only return email for verification
          reset_token_expires: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { valid: false, error: 'Invalid or expired reset token' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { valid: true, email: user.email },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
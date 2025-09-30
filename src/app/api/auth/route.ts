import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database-postgres'
import { hashPassword, verifyPassword, generateToken, validatePassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'

// Input validation schemas
const SignupSchema = z.object({
  mode: z.literal('signup'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
})

const LoginSchema = z.object({
  mode: z.literal('login'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  // Apply rate limiting (5 attempts per 15 minutes)
  const rateLimitResponse = await checkRateLimit(request, 'auth')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()

    // Validate mode first
    if (!body.mode || !['signup', 'login'].includes(body.mode)) {
      return NextResponse.json({
        error: 'Invalid mode. Must be "signup" or "login"'
      }, { status: 400 })
    }

    if (body.mode === 'signup') {
      // Validate signup input
      const validation = SignupSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validation.error.errors.map(e => e.message)
        }, { status: 400 })
      }

      const { email, password, name } = validation.data

      // Additional password strength validation
      const passwordCheck = validatePassword(password)
      if (!passwordCheck.valid) {
        return NextResponse.json({
          error: 'Password is too weak',
          details: passwordCheck.errors
        }, { status: 400 })
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({
          error: 'User already exists with this email'
        }, { status: 409 }) // 409 Conflict
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          company: 'New Account',
          subscription_tier: 'free'
        }
      })

      // Generate JWT token
      const token = generateToken(newUser.id, newUser.email)

      // Create response with token in cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          company: newUser.company
        },
        token // Also return in body for client-side storage if needed
      })

      // Set HTTP-only cookie for added security
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      console.log(`✅ User created: ${email}`)

      return response

    } else {
      // LOGIN
      const validation = LoginSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validation.error.errors.map(e => e.message)
        }, { status: 400 })
      }

      const { email, password } = validation.data

      // Find user with password
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          password: true
        }
      })

      if (!user) {
        // Don't reveal whether email exists or not (security best practice)
        return NextResponse.json({
          error: 'Invalid email or password'
        }, { status: 401 })
      }

      if (!user.password) {
        return NextResponse.json({
          error: 'Account exists but no password set. Please use password reset.'
        }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        return NextResponse.json({
          error: 'Invalid email or password'
        }, { status: 401 })
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email)

      // Create response with token
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company
        },
        token
      })

      // Set HTTP-only cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      console.log(`✅ User logged in: ${email}`)

      return response
    }

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })

  // Clear the auth cookie
  response.cookies.delete('auth_token')

  return response
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    const { mode, email, password, name } = await request.json()
    
    if (mode === 'signup') {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'User already exists' 
        }, { status: 400 })
      }
      
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          company: 'New Account',
          subscription_tier: 'free'
        }
      })
      
      return NextResponse.json({
        success: true,
        user: {
          name: newUser.name,
          email: newUser.email,
          company: newUser.company
        }
      })
      
    } else {
      // Login - find existing user
      const user = await prisma.user.findUnique({
        where: { email }
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
          company: user.company
        }
      })
    }
    
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
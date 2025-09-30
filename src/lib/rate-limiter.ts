// src/lib/rate-limiter.ts
// Rate limiting utilities to prevent API abuse

import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'

// Different rate limiters for different endpoint types
const rateLimiters = {
  // Standard API endpoints: 60 requests per minute
  standard: new RateLimiterMemory({
    points: 60,
    duration: 60,
  }),

  // Authentication endpoints: 5 attempts per 15 minutes (prevent brute force)
  auth: new RateLimiterMemory({
    points: 5,
    duration: 15 * 60,
  }),

  // AI-powered endpoints: 10 requests per hour (expensive!)
  ai: new RateLimiterMemory({
    points: 10,
    duration: 60 * 60,
  }),

  // Competitive scraping: 20 requests per hour
  scraping: new RateLimiterMemory({
    points: 20,
    duration: 60 * 60,
  }),

  // File uploads: 5 uploads per hour
  upload: new RateLimiterMemory({
    points: 5,
    duration: 60 * 60,
  }),
}

/**
 * Get client identifier (IP address or user ID)
 */
function getClientId(request: NextRequest): string {
  // Prefer user ID if authenticated
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip || 'unknown'
  return `ip:${ip}`
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'standard'
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterType]
  const clientId = getClientId(request)

  try {
    await limiter.consume(clientId, 1)
    return null // No rate limit hit
  } catch (rateLimiterRes: any) {
    // Rate limit exceeded
    const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000)

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limiter.points.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString()
        }
      }
    )
  }
}

/**
 * Rate limit middleware for API routes
 * Usage: const rateLimitResponse = await checkRateLimit(request, 'ai')
 */
export async function checkRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'standard'
): Promise<NextResponse | null> {
  return applyRateLimit(request, limiterType)
}

/**
 * Get rate limit status (for informational purposes)
 */
export async function getRateLimitStatus(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'standard'
): Promise<{ remaining: number; limit: number; resetAt: Date }> {
  const limiter = rateLimiters[limiterType]
  const clientId = getClientId(request)

  try {
    const res = await limiter.get(clientId)
    const remaining = res ? Math.max(0, limiter.points - res.consumedPoints) : limiter.points
    const resetAt = res ? new Date(Date.now() + res.msBeforeNext) : new Date()

    return {
      remaining,
      limit: limiter.points,
      resetAt
    }
  } catch (error) {
    return {
      remaining: limiter.points,
      limit: limiter.points,
      resetAt: new Date()
    }
  }
}
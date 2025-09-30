// src/lib/api-auth.ts
// Helper utilities for API route authentication

import { NextRequest } from 'next/server'
import { getUserFromRequest, TokenPayload } from './auth'

/**
 * Get authenticated user ID from request headers (set by middleware)
 * Falls back to token verification if headers not present
 */
export function getAuthenticatedUserId(request: NextRequest): string | null {
  // First try to get from headers (set by middleware)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return userId
  }

  // Fallback: verify token directly
  const user = getUserFromRequest(request)
  return user?.userId || null
}

/**
 * Get authenticated user email from request
 */
export function getAuthenticatedUserEmail(request: NextRequest): string | null {
  // First try to get from headers (set by middleware)
  const email = request.headers.get('x-user-email')
  if (email) {
    return email
  }

  // Fallback: verify token directly
  const user = getUserFromRequest(request)
  return user?.email || null
}

/**
 * Get full user object from request
 */
export function getAuthenticatedUser(request: NextRequest): TokenPayload | null {
  return getUserFromRequest(request)
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request: NextRequest): TokenPayload {
  const user = getUserFromRequest(request)
  if (!user) {
    throw new Error('Unauthorized - Authentication required')
  }
  return user
}

/**
 * Check if user owns a resource
 */
export function checkResourceOwnership(
  request: NextRequest,
  resourceUserId: string
): boolean {
  const authenticatedUserId = getAuthenticatedUserId(request)
  if (!authenticatedUserId) {
    return false
  }
  return authenticatedUserId === resourceUserId
}
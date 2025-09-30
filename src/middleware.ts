// src/middleware.ts
// Authentication middleware to protect API routes

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromRequest } from './lib/auth'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth',
  '/api/auth/reset-password',
  '/',
  '/features',
  '/reset-password'
]

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // TEMPORARY: Middleware is DISABLED for backwards compatibility
  // TODO: Enable after updating frontend to use new auth
  // See SECURITY_IMPLEMENTATION.md for details

  const MIDDLEWARE_ENABLED = false // Set to true when ready

  if (!MIDDLEWARE_ENABLED) {
    // Just add user headers if token present, but don't block
    const user = getUserFromRequest(request)
    if (user && pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.userId)
      requestHeaders.set('x-user-email', user.email)
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    }
    return NextResponse.next()
  }

  // Original middleware logic (enabled when flag is true)
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-email', user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/analytics') ||
      pathname.startsWith('/alerts') ||
      pathname.startsWith('/competitive') ||
      pathname.startsWith('/history') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/settings')) {

    const user = getUserFromRequest(request)

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
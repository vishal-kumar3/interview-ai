import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from './src/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = await rateLimit(request, {
      interval: 60, // 1 minute
      requests: 10
    })

    if (!rateLimitResult.success) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    if (rateLimitResult.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    }
  }

  // Enhanced rate limiting for AI endpoints
  if (request.nextUrl.pathname.includes('/ai') ||
      request.nextUrl.pathname.includes('/interview')) {
    const rateLimitResult = await rateLimit(request, {
      interval: 300, // 5 minutes
      requests: 5
    })

    if (!rateLimitResult.success) {
      return new NextResponse('AI Rate Limit Exceeded', { status: 429 })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

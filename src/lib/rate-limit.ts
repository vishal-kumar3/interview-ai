import { NextRequest } from 'next/server'
import redis from '@/config/redis.config'

interface RateLimitConfig {
  interval: number // seconds
  requests: number
}

export const rateLimit = async (
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<{ success: boolean; remaining?: number }> => {
  // Extract IP from headers since NextRequest doesn't have .ip property
  const ip = identifier ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous'

  const key = `rate_limit:${ip}:${request.nextUrl.pathname}`

  try {
    // Use direct Redis commands for rate limiting (no JSON parsing needed)
    const current = parseInt(await redis.get(key) || '0', 10)

    if (current >= config.requests) {
      return { success: false }
    }

    const pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, config.interval)
    await pipe.exec()

    return {
      success: true,
      remaining: config.requests - (current + 1)
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    return { success: true } // Fail open
  }
}

// Helper function for common rate limit scenarios
export const createRateLimiter = (config: RateLimitConfig) => {
  return (request: NextRequest, identifier?: string) =>
    rateLimit(request, config, identifier)
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimiter({
  interval: 60, // 1 minute
  requests: 60
})

export const aiRateLimit = createRateLimiter({
  interval: 300, // 5 minutes
  requests: 10
})

export const uploadRateLimit = createRateLimiter({
  interval: 3600, // 1 hour
  requests: 5
})

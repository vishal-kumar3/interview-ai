import { RedisChat } from '@/actions/chat.action';
import { Redis } from '@upstash/redis'

if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  throw new Error('Redis configuration is missing. Please set REDIS_URL and REDIS_TOKEN in your environment variables.')
}

// Convert TCP URL to HTTPS URL if needed
const getRedisUrl = () => {
  const url = process.env.REDIS_URL!;

  // If it's already an HTTPS URL, use it as is
  if (url.startsWith('https://')) {
    return url;
  }

  // If it's a TCP URL (rediss://), extract the host and convert to HTTPS
  if (url.startsWith('rediss://')) {
    // Extract host from rediss://default:token@host:port format
    const match = url.match(/rediss:\/\/[^@]+@([^:]+)/);
    if (match) {
      return `https://${match[1]}`;
    }
  }

  // Fallback: assume it's just the host
  return url.startsWith('http') ? url : `https://${url}`;
}

const redis = new Redis({
  url: getRedisUrl(),
  token: process.env.REDIS_TOKEN,
})

export enum RedisCachePrefix {
  INTERVIEW = 'interview_chat',
  RESUME = 'resume',
}

export const createCacheKey = (prefix: RedisCachePrefix, id: string) => {
  return `${prefix}:${id}`
}

export const redisCache = {
  client: redis,

  getString: async (key: string) => {
    try {
      const value = await redis.get<string>(key)
      return value
    } catch (error) {
      console.error('Error getting from Redis:', error)
      return null
    }
  },

  getJson: async (key: string) => {
    try {
      const value = await redis.get<RedisChat>(key)
      console.log(typeof value)
      return value
    } catch (error) {
      console.error('Error getting JSON from Redis:', error)
      return null
    }
  },

  set: async (key: string, value: any, ttl: number = 60*60*12) => {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Error setting to Redis:', error)
    }
  },

  del: async (key: string) => {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Error deleting from Redis:', error)
    }
  },
  exists: async (key: string) => {
    try {
      const exists = await redis.exists(key)
      return exists > 0
    } catch (error) {
      console.error('Error checking existence in Redis:', error)
      return false
    }
  },
}

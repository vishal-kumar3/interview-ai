import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
})

export default redis

export enum RedisCachePrefix {
  INTERVIEW = 'interview_chat',
}

export const createCacheKey = (prefix: RedisCachePrefix, id: string) => {
  return `${prefix}:${id}`
}

export const redisCache = {
  get: async (key: string) => {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Error getting from Redis:', error)
      return null
    }
  },

  set: async (key: string, value: any, ttl: number = 60*60*12) => {
    try {
      console.log("chat: ", JSON.stringify(value))
      await redis.set(key, JSON.stringify(value), 'EX', ttl)
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

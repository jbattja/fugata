import { Redis } from 'ioredis'
import { IdempotencyKey } from '../types'
import { Logger } from '@nestjs/common';

export class RedisService {
  private redis: Redis

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 100, 2000)
        return delay
      },
      maxRetriesPerRequest: 5
    })

    this.redis.on('error', (err) => {
      Logger.error('Redis error:', err, RedisService.name);
    })
  }

  // Ensure Redis is connected
  async ensureConnection(): Promise<void> {
    if (this.redis.status !== 'ready') {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis connection timeout'))
        }, 10000)

        this.redis.once('ready', () => {
          clearTimeout(timeout)
          resolve()
        })

        this.redis.once('error', (err) => {
          clearTimeout(timeout)
          reject(err)
        })
      })
    }
  }

  // Rate limiting
  async checkRateLimit(merchantId: string, limit: number, windowSeconds: number): Promise<boolean> {
    await this.ensureConnection()
    const key = `ratelimit:${merchantId}`
    const current = await this.redis.incr(key)
    
    if (current === 1) {
      await this.redis.expire(key, windowSeconds)
    }

    return current <= limit
  }

  // Idempotency key management
  async checkIdempotencyKey(key: string): Promise<IdempotencyKey | null> {
    await this.ensureConnection()
    const cached = await this.redis.get(`idempotency:${key}`)
    return cached ? JSON.parse(cached) : null
  }

  async setIdempotencyKey(
    key: string,
    response: any,
    ttlSeconds: number = 86400 // 24 hours
  ): Promise<void> {
    await this.ensureConnection()
    const idempotencyKey: IdempotencyKey = {
      key,
      response,
      expiresAt: Date.now() + ttlSeconds * 1000
    }

    await this.redis.setex(
      `idempotency:${key}`,
      ttlSeconds,
      JSON.stringify(idempotencyKey)
    )
  }

  // Utility methods
  async clearKey(key: string): Promise<void> {
    await this.ensureConnection()
    await this.redis.del(key)
  }

  async disconnect(): Promise<void> {
    await this.redis.quit()
  }
} 
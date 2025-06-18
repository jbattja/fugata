import { FastifyReply, FastifyRequest } from 'fastify'
import { RedisService } from '../services/redis.service'
import { ErrorCodes } from '../types'

export class IdempotencyMiddleware {
  constructor(private redisService: RedisService) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const idempotencyKey = request.headers['idempotency-key']

    // Only check idempotency for POST, PUT, PATCH methods
    if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      reply.status(400).send({
        code: ErrorCodes.IDEMPOTENCY_CONFLICT,
        message: 'Idempotency key is required for this operation'
      })
      return
    }

    const existingKey = await this.redisService.checkIdempotencyKey(idempotencyKey)

    if (existingKey) {
      // If we find an existing key, return the cached response
      reply.status(200).send(existingKey.response)
      return
    }

    // Store the original send function
    const originalSend = reply.send.bind(reply)
    const redisService = this.redisService

    // Override the send function to cache the response
    reply.send = function (payload: any) {
      // Cache the response before sending it
      redisService
        .setIdempotencyKey(idempotencyKey as string, payload)
        .catch((err: Error) => {
          request.log.error('Failed to cache idempotency key', err)
        })

      // Call the original send function with the correct context
      return originalSend(payload)
    }
  }
} 
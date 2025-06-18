import { FastifyReply, FastifyRequest } from 'fastify'
import { RedisService } from '../services/redis.service'
import { ApiKeyService } from '../services/api-key.service'
import { AuthenticatedRequest, ErrorCodes } from '../types'

export class AuthMiddleware {
  constructor(
    private redisService: RedisService,
    private apiKeyService: ApiKeyService
  ) {}

  authenticate = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const apiKey = request.headers['x-api-key']

    if (!apiKey || typeof apiKey !== 'string') {
      reply.status(401).send({
        code: ErrorCodes.INVALID_API_KEY,
        message: 'API key is required'
      })
      return
    }

    // Check API key service first
    const apiKeyData = await this.apiKeyService.findApiKey(apiKey)
    
    if (!apiKeyData) {
      reply.status(401).send({
        code: ErrorCodes.INVALID_API_KEY,
        message: 'Invalid API key'
      })
      return
    }

    // Check rate limit
    const isWithinLimit = await this.redisService.checkRateLimit(
      apiKeyData.clientId,
      apiKeyData.rateLimit.requests,
      apiKeyData.rateLimit.interval
    )

    if (!isWithinLimit) {
      reply.status(429).send({
        code: ErrorCodes.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded'
      })
      return
    }

    // Attach API key info to request for later use
    ;(request as AuthenticatedRequest).apiKey = apiKeyData
  }

  checkPermission = (requiredPermission: string) => {
    return async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      const authenticatedRequest = request as AuthenticatedRequest
      
      if (!authenticatedRequest.apiKey?.permissions.includes(requiredPermission)) {
        reply.status(403).send({
          code: ErrorCodes.PERMISSION_DENIED,
          message: `Missing required permission: ${requiredPermission}`
        })
        return
      }
    }
  }
} 
import 'reflect-metadata';
import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import fastifyRedis from '@fastify/redis'

import { RedisService } from './services/redis.service'
import { ApiKeyService } from './services/api-key.service'
import { ProxyService } from './services/proxy.service'
import { AuthMiddleware } from './middleware/auth.middleware'
import { IdempotencyMiddleware } from './middleware/idempotency.middleware'
import { RouteConfig } from './types'
import { routes } from './config/routes'

// Environment variables
const PORT = process.env.PORT || 4000
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const SETTINGS_SERVICE_URL = process.env.SETTINGS_SERVICE_URL || 'http://localhost:3000'
const PAYMENT_PROCESSOR_URL = process.env.PAYMENT_PROCESSOR_URL || 'http://localhost:3002'
const PAYMENT_DATA_URL = process.env.PAYMENT_DATA_URL || 'http://localhost:3001'

function registerRoute(
  app: ReturnType<typeof fastify>,
  route: RouteConfig,
  proxyService: ProxyService,
  authMiddleware: AuthMiddleware,
  idempotencyMiddleware: IdempotencyMiddleware
) {
  app.route({
    method: route.method,
    url: route.path,
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Authenticate first
      await authMiddleware.authenticate(request, reply)
      
      // Then check specific permissions
      await authMiddleware.checkPermission(route.requiredPermission)(request, reply)
      
      // Check idempotency if required
      if (route.requiresIdempotency) {
        await idempotencyMiddleware.handle(request, reply)
      }

      // Check rate limit if specified
      if (route.rateLimit) {
        // TODO: Implement per-route rate limiting
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      await proxyService.proxyRequest(route.service, route.targetPath, request, reply)
    }
  })
}

async function buildApp() {
  const app = fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      }
    }
  })

  // Error handler
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error)
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred'
    })
  })

  // Register plugins
  await app.register(cors, {
    origin: true
  })

  // Initialize services
  const redisService = new RedisService(REDIS_URL)
  const apiKeyService = new ApiKeyService(SETTINGS_SERVICE_URL)
  
  // Ensure Redis is connected before proceeding
  try {
    await redisService.ensureConnection()
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }

  // Now register the fastify-redis plugin
  await app.register(fastifyRedis, {
    url: REDIS_URL,
    closeClient: true
  })

  const proxyService = new ProxyService(PAYMENT_PROCESSOR_URL, PAYMENT_DATA_URL)

  // Initialize middleware
  const authMiddleware = new AuthMiddleware(redisService, apiKeyService)
  const idempotencyMiddleware = new IdempotencyMiddleware(redisService)

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  // API key cache stats route
  app.get('/api-keys/stats', async () => {
    return apiKeyService.getCacheStats()
  })

  // Force refresh API key cache route
  app.post('/api-keys/refresh', async () => {
    await apiKeyService.refreshCache()
    return { message: 'API key cache refreshed' }
  })

  // Register all configured routes
  routes.forEach(route => {
    registerRoute(app, route, proxyService, authMiddleware, idempotencyMiddleware)
  })

  // Generate Swagger documentation
  await app.ready()

  return app
}

// Start the server
async function start() {
  try {
    const app = await buildApp()
    await app.listen({ port: PORT as number, host: '0.0.0.0' })
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  start()
}

export { buildApp } 
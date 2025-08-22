import { RouteConfig } from '../types'

export const routes: RouteConfig[] = [
  // Payment Sessions
  {
    method: 'POST',
    path: '/sessions',
    service: 'payment-processor',
    targetPath: '/sessions',
    requiresIdempotency: true,
    requiredPermission: 'payments:write'
  },
  {
    method: 'GET',
    path: '/sessions',
    service: 'payment-data',
    targetPath: '/payment-sessions',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },
  {
    method: 'GET',
    path: '/sessions/:id',
    service: 'payment-data',
    targetPath: '/payment-sessions/:id',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },

  // Payments
  {
    method: 'POST',
    path: '/payments',
    service: 'payment-processor',
    targetPath: '/payments',
    requiresIdempotency: true,
    requiredPermission: 'payments:write',
  },
  {
    method: 'GET',
    path: '/payments',
    service: 'payment-data',
    targetPath: '/payments',
    requiresIdempotency: false,
    requiredPermission: 'payments:read',
    rateLimit: {
      requests: 100,
      interval: 60
    }
  },
  {
    method: 'POST',
    path: '/adyen/payments',
    service: 'payment-processor',
    targetPath: '/adyen/payments',
    requiresIdempotency: true,
    requiredPermission: 'payments:write',
    rateLimit: {
      requests: 100,
      interval: 60
    }
  },

  // API Credentials
  {
    method: 'GET',
    path: '/api-credentials',
    service: 'settings-service',
    targetPath: '/api-credentials',
    requiresIdempotency: false,
    requiredPermission: 'settings:read'
  },
  {
    method: 'POST',
    path: '/api-credentials/api-key',
    service: 'settings-service',
    targetPath: '/api-credentials/api-key',
    requiresIdempotency: false,
    requiredPermission: 'settings:write'
  }
] 
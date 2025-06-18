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
    path: '/sessions/:id',
    service: 'payment-processor',
    targetPath: '/sessions/:id',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },

  // Payment Data
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
  }
] 
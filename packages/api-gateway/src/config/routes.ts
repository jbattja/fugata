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
  {
    method: 'GET',
    path: '/payments/:id',
    service: 'payment-data',
    targetPath: '/payments/:id',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },
  {
    method: 'GET',
    path: '/payments/:id/operations',
    service: 'payment-data',
    targetPath: '/payments/:id/operations',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },
  {
    method: 'GET',
    path: '/payments/operations/:operationId',
    service: 'payment-data',
    targetPath: '/payments/operations/:operationId',
    requiresIdempotency: false,
    requiredPermission: 'payments:read'
  },
  {
    method: 'POST',
    path: '/payments/:id/capture',
    service: 'payment-processor',
    targetPath: '/payments/:id/capture',
    requiresIdempotency: true,
    requiredPermission: 'payments:write'
  },
  {
    method: 'POST',
    path: '/payments/:id/refund',
    service: 'payment-processor',
    targetPath: '/payments/:id/refund',
    requiresIdempotency: true,
    requiredPermission: 'payments:write'
  },
  {
    method: 'POST',
    path: '/payments/:id/void',
    service: 'payment-processor',
    targetPath: '/payments/:id/void',
    requiresIdempotency: true,
    requiredPermission: 'payments:write'
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
  },

  // Token Vault (Card Tokens)
  {
    method: 'POST',
    path: '/token-vault/tokens',
    service: 'token-vault',
    targetPath: '/token-vault/tokens',
    requiresIdempotency: true,
    requiredPermission: 'tokens:write'
  },
  {
    method: 'GET',
    path: '/token-vault/tokens/:token',
    service: 'token-vault',
    targetPath: '/token-vault/tokens/:token',
    requiresIdempotency: false,
    requiredPermission: 'tokens:read'
  },
  {
    method: 'DELETE',
    path: '/token-vault/tokens/:token',
    service: 'token-vault',
    targetPath: '/token-vault/tokens/:token',
    requiresIdempotency: false,
    requiredPermission: 'tokens:write'
  },
  {
    method: 'GET',
    path: '/token-vault/customers/:customerId/tokens',
    service: 'token-vault',
    targetPath: '/token-vault/customers/:customerId/tokens',
    requiresIdempotency: false,
    requiredPermission: 'tokens:read'
  },
  {
    method: 'GET',
    path: '/token-vault/merchants/:merchantId/tokens',
    service: 'token-vault',
    targetPath: '/token-vault/merchants/:merchantId/tokens',
    requiresIdempotency: false,
    requiredPermission: 'tokens:read'
  }
] 
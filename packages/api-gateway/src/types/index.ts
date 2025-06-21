import { FastifyRequest } from 'fastify'
import { Type } from '@sinclair/typebox'

// API Key related types
export interface ApiKey {
  key: string
  merchant: {
    id: string
    accountCode: string
  }
  permissions: string[]
  rateLimit: {
    requests: number
    interval: number // in seconds
  }
}

// Request with API Key
export interface AuthenticatedRequest extends FastifyRequest {
  apiKey?: ApiKey
}

// Idempotency related types
export interface IdempotencyKey {
  key: string
  response: any
  expiresAt: number
}

// Route configuration types
export type ServiceName = 'payment-processor' | 'payment-data' | 'settings-service'

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  service: ServiceName
  targetPath: string
  requiresIdempotency: boolean
  requiredPermission: string
  rateLimit?: {
    requests: number
    interval: number // in seconds
  }
  description?: string
  tags?: string[]
}

// JSON Schema for API Key validation
export const ApiKeySchema = Type.Object({
  key: Type.String(),
  merchant: Type.Object({
    id: Type.String(),
    accountCode: Type.String()
  }),
  permissions: Type.Array(Type.String()),
  rateLimit: Type.Object({
    requests: Type.Number(),
    interval: Type.Number()
  })
})

// Error types
export enum ErrorCodes {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT'
}

export interface ApiError {
  code: ErrorCodes
  message: string
  details?: Record<string, any>
} 
import * as jwt from 'jsonwebtoken'

export interface ServiceTokenPayload {
  // Core authentication fields
  merchantId?: string // For service-to-service (single merchant)
  merchantIds?: string[] // For dashboard users (multiple merchants)
  permissions: string[]
  service?: string // For service-to-service communication
  
  // User context (for dashboard authentication)
  userId?: string
  username?: string
  email?: string
  role?: 'admin' | 'user'
  
  // JWT standard fields
  iat: number
  exp: number
  iss?: string // issuer
  aud?: string // audience
}

export class JwtService {
  private readonly secret: string
  private readonly issuer: string = 'fugata-api-gateway'
  private readonly audience: string = 'fugata-services'

  constructor(secret: string) {
    this.secret = secret
  }

  generateServiceToken(
    merchantId: string,
    permissions: string[],
    service: string,
    expiresIn: string = '5m' // Short-lived tokens for security
  ): string {
    const payload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
      merchantId,
      permissions,
      service
    }

    // Using a more explicit approach to avoid TypeScript issues
    return (jwt as any).sign(payload, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
      expiresIn
    })
  }

  generateServiceAccountToken() {
    return jwt.sign(
      {
        service: 'api-gateway',
        permissions: ['api-key:read', 'api-key:write'], 
        role: 'service'
      }, this.secret,
      {
        issuer: 'fugata-api-gateway',
        audience: 'fugata-services',
        expiresIn: '5m'
      }
    );
  }

  getAuthHeadersForServiceAccount(): Record<string, string> {
    const serviceToken = this.generateServiceAccountToken();
    return {
        'Authorization': `Bearer ${serviceToken}`,
        'X-Service-Token': 'true',
        'Content-Type': 'application/json'
    };
}

  // New method for generating tokens that can be validated by both API Gateway and services
  generateUnifiedToken(
    payload: {
      merchantId?: string
      merchantIds?: string[]
      permissions: string[]
      service?: string
      userId?: string
      username?: string
      email?: string
      role?: 'admin' | 'user'
    },
    expiresIn: string = '5m'
  ): string {
    const tokenPayload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
      ...payload
    }

    return (jwt as any).sign(tokenPayload, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
      expiresIn
    })
  }

  verifyServiceToken(token: string): ServiceTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience
      }) as ServiceTokenPayload

      return decoded
    } catch (error) {
      throw new Error(`Invalid service token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Verify tokens from both API Gateway and Dashboard
  verifyUnifiedToken(token: string): ServiceTokenPayload {
    try {
      // Try to verify with API Gateway issuer
      const decoded = jwt.verify(token, this.secret, {
        audience: this.audience
      }) as ServiceTokenPayload

      return decoded
    } catch (error) {
      throw new Error(`Invalid unified token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 
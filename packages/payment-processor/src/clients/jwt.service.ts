import * as jwt from 'jsonwebtoken';

export interface ServiceTokenPayload {
  // Core authentication fields
  merchantId?: string;
  merchantIds?: string[];
  permissions: string[];
  service?: string;
  
  // User context
  userId?: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  
  // JWT standard fields
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

export class JwtService {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  generateServiceAccountToken() {
    return jwt.sign(
      {
        service: 'payment-processor',
        permissions: ['merchants:read', 'providers:read'], 
        role: 'service'
      },
      this.secret,
      {
        issuer: 'fugata-payment-processor',
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


} 
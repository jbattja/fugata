import * as jwt from 'jsonwebtoken';
import { ServiceTokenPayload } from './types';
import { User } from '../types/settings/users';

export class JwtService {
  private readonly secret: string;
  private readonly service: string;
  private readonly servicePermissions: string[]
  private readonly audience: string = 'fugata-services';
  private readonly serviceAccountIssuer: string = 'fugata-master-issuer';

  constructor(secret: string, service: string, servicePermissions: string[]) {
    this.secret = secret;
    this.service = service;
    this.servicePermissions = servicePermissions;
  }

  // API Gateway style token generation
  generateApiUserServiceToken(
    merchantId: string,
    merchantCode: string,
    permissions: string[],
    service: string,
    expiresIn: string = '5m'
  ): string {
    const payload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
      merchant: {
        id: merchantId,
        accountCode: merchantCode
      },
      permissions,
      service
    };

    return (jwt as any).sign(payload, this.secret, {
      issuer: this.service,
      audience: this.audience,
      expiresIn
    });
  }

  // Dashboard style token generation
  generateDashboardUserServiceToken(
    user: User,
    targetService: string,
    targetMerchantId?: string,
    expiresIn: string = '5m'
  ): string {
    const permissions = this.getPermissionsForRole(user.role);
    
    const payload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions,
      service: targetService,
      merchant: targetMerchantId ? {
        id: targetMerchantId
    } : undefined
    };

    return (jwt as any).sign(payload, this.secret, {
      issuer: this.service,
      audience: this.audience,
      expiresIn
    });
  }

  // Service account token generation
  generateServiceAccountToken(): string {
    return jwt.sign(
      {
        service: this.service,
        permissions: this.servicePermissions,
        role: 'service'
      },
      this.secret,
      {
        issuer: this.serviceAccountIssuer,
        audience: this.audience,
        expiresIn: '5m'
      }
    );
  }

  // Get auth headers for service account
  getAuthHeadersForServiceAccount(): Record<string, string> {
    const serviceToken = this.generateServiceAccountToken();
    return {
      'Authorization': `Bearer ${serviceToken}`,
      'X-Service-Token': 'true',
      'Content-Type': 'application/json'
    };
  }

  // Verify tokens from any issuer
  verifyToken(token: string): ServiceTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        audience: this.audience
      }) as ServiceTokenPayload;

      return decoded;
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify tokens from specific issuer
  verifyServiceToken(token: string): ServiceTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: this.service,
        audience: this.audience
      }) as ServiceTokenPayload;

      return decoded;
    } catch (error) {
      throw new Error(`Invalid service token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getPermissionsForRole(role: 'admin' | 'user'): string[] {
    switch (role) {
      case 'admin':
        return [
          'payments:read',
          'payments:write',
          'merchants:read',
          'merchants:write',
          'users:read',
          'users:write',
          'providers:read',
          'providers:write',
          'settings:read',
          'settings:write'
        ];
      case 'user':
        return [
          'payments:read',
          'payments:write',
          'merchants:read',
          'providers:read',
          'settings:read'
        ];
      default:
        return [];
    }
  }
} 
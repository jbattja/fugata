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
  private readonly issuer: string = 'fugata-dashboard';
  private readonly audience: string = 'fugata-services';

  constructor(secret: string) {
    this.secret = secret;
  }

  generateServiceToken(
    user: {
      id: string;
      username: string;
      email: string;
      merchantIds: string[];
      role: 'admin' | 'user';
    },
    targetService: string,
    targetMerchantId?: string,
    expiresIn: string = '5m'
  ): string {
    // Determine permissions based on user role
    const permissions = this.getPermissionsForRole(user.role);
    
    // For admin users, they can access all merchants
    // For regular users, they can only access their assigned merchants
    const payload: Omit<ServiceTokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      email: user.email,
      merchantIds: user.merchantIds,
      role: user.role,
      permissions,
      service: targetService
    };

    // If a specific merchant is targeted, set it as the primary merchant
    if (targetMerchantId) {
      if (user.role === 'admin' || user.merchantIds.includes(targetMerchantId)) {
        payload.merchantId = targetMerchantId;
      } else {
        throw new Error('User does not have access to the specified merchant');
      }
    }

    // Using type assertion to avoid TypeScript JWT issues
    return (jwt as any).sign(payload, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
      expiresIn
    });
  }

  generateServiceAccountToken() {
    return jwt.sign(
      {
        service: 'dashboard',
        permissions: ['users:read', 'users:validate'], 
        role: 'service'
      }, this.secret,
      {
        issuer: 'fugata-dashboard',
        audience: 'fugata-services',
        expiresIn: '5m'
      }
    );
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

  verifyServiceToken(token: string): ServiceTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience
      }) as ServiceTokenPayload;

      return decoded;
    } catch (error) {
      throw new Error(`Invalid service token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
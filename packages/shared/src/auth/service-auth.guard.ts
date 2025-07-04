import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ServiceTokenPayload } from './types';

export interface AuthenticatedRequest {
  user: ServiceTokenPayload;
  merchantId?: string; // Current merchant context
  userId?: string;
  role?: string;
}

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly secret: string;
  private readonly validIssuers: string[] = ['fugata-api-gateway', 'fugata-dashboard', 'fugata-payment-processor', 'fugata-master-issuer'];
  private readonly audience: string = 'fugata-services';

  constructor(secret: string) {
    this.secret = secret;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Service token is required');
    }

    try {
      const payload = this.verifyToken(token);
      this.validateToken(payload, request);
      
      // Attach user and merchant info to request
      request.user = payload;
      
      // Set merchant context - prefer single merchantId for service-to-service
      if (payload.merchant && payload.merchant.id) {
        request.merchantId = payload.merchant.id;
        request.merchantCode = payload.merchant.accountCode;
      }      
      request.userId = payload.userId;
      request.role = payload.role;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid service token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token: string): ServiceTokenPayload {
    const decoded = jwt.decode(token);
    let issuer = '';
    if (decoded && (decoded as any).iss) {
      issuer = (decoded as any).iss;
    }
    if (!issuer || !this.validIssuers.includes(issuer)) {
      throw new UnauthorizedException('Invalid service token');
    }
    
    return jwt.verify(token, this.secret, {
      issuer: issuer,
      audience: this.audience,
    }) as ServiceTokenPayload;
  }

  private validateToken(payload: ServiceTokenPayload, request: any): void {
    // Validate that this token is for service-to-service communication
    if (!request.headers['x-service-token']) {
      throw new UnauthorizedException('Service token required for internal communication');
    }

    // Validate merchant ID header matches token (for service-to-service)
    if (payload.merchant && payload.merchant.id) {
      const headerMerchantId = request.headers['x-merchant-id'];
      if (headerMerchantId && headerMerchantId !== payload.merchant.id) {
        throw new UnauthorizedException('Merchant ID mismatch');
      }
    }
  }
}

// Decorator to require specific permissions
export const RequirePermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // In NestJS, the request object is typically the last parameter or can be found by looking for an object with user property
      let request = null;
      
      // Try to find the request object by looking for an object with user property
      for (const arg of args) {
        if (arg && typeof arg === 'object' && arg.user) {
          request = arg;
          break;
        }
      }
      
      // If not found, try to find by looking for an object with headers property
      if (!request) {
        for (const arg of args) {
          if (arg && typeof arg === 'object' && arg.headers) {
            request = arg;
            break;
          }
        }
      }
      
      if (request && request.user) {
        const hasAllPermissions = permissions.every(permission => 
          request.user.permissions.includes(permission)
        );
        
        if (!hasAllPermissions) {
          throw new UnauthorizedException(`Missing required permissions: ${permissions.join(', ')}`);
        }
      } else {
        Logger.warn(`RequirePermissions decorator: Could not find request object with user in method ${propertyKey}`, ServiceAuthGuard.name);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

// Decorator to require admin role
export const RequireAdmin = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // In NestJS, the request object is typically the last parameter or can be found by looking for an object with user property
      let request = null;
      
      // Try to find the request object by looking for an object with user property
      for (const arg of args) {
        if (arg && typeof arg === 'object' && arg.user) {
          request = arg;
          break;
        }
      }
      
      // If not found, try to find by looking for an object with headers property
      if (!request) {
        for (const arg of args) {
          if (arg && typeof arg === 'object' && arg.headers) {
            request = arg;
            break;
          }
        }
      }
      
      if (request && request.user && request.user.role !== 'admin') {
        throw new UnauthorizedException('Admin role required');
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

// Helper function to get merchant ID from request
export function getMerchant(request: any): {
  id: string;
  accountCode: string;
} {
  return request.merchant || request.user?.merchant;
}

export function getMerchantIds(request: any): string[] {
    if (request.user.merchantIds) {
      return request.user.merchantIds;
    }
    if (request.merchant) {
      return [request.merchant.id];
    }
    return [];
}

// Helper function to get user ID from request
export function getUserId(request: any): string {
  return request.userId || request.user?.userId;
}

// Helper function to get user role from request
export function getUserRole(request: any): string {
  return request.role || request.user?.role;
}

export function isAdmin(request: any): boolean {
  return request.user?.role === 'admin';
}

// Helper function to check if user has access to a specific merchant
export function hasMerchantAccess(request: any, merchantId: string): boolean {
  const user = request.user;
  if (!user) return false;
  
  // Admin has access to all merchants
  if (user.role === 'admin') return true;
  
  // Check single merchant access (service-to-service)
  if (user.merchantId && user.merchantId === merchantId) return true;
  
  // Check multiple merchant access (dashboard)
  if (user.merchantIds && user.merchantIds.includes(merchantId)) return true;
  
  return false;
} 
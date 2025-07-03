export interface ServiceTokenPayload {
    // Core authentication fields
    merchant?: {
      id: string;
      accountCode?: string;
    };
    permissions: string[];
    service?: string; // For service-to-service communication
    
    // User context (for dashboard authentication)
    userId?: string;
    username?: string;
    email?: string;
    merchantIds?: string[];
    role?: 'admin' | 'user' | 'service';
    
    // JWT standard fields
    iat: number;
    exp: number;
    iss?: string; // issuer
    aud?: string; // audience
  }
  
import { JwtService } from '@fugata/shared';

// Create a singleton instance for the checkout service
const jwtService = new JwtService(
  process.env.JWT_SECRET || 'your-secret-key',
  'fugata-payment-processor',
  ['merchants:read', 'providers:read']
);

export { jwtService }; 


  /**
   * Extract authorization headers from the request
   */
  export function extractAuthHeaders(request: any): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Extract Authorization header
    if (request.headers?.authorization) {
      headers['Authorization'] = request.headers.authorization;
    }
    
    // Extract X-Service-Token header
    if (request.headers?.['x-service-token']) {
      headers['X-Service-Token'] = request.headers['x-service-token'];
    }
    
    // Extract X-Merchant-ID header
    if (request.headers?.['x-merchant-id']) {
      headers['X-Merchant-ID'] = request.headers['x-merchant-id'];
    }
    
    // Extract Content-Type header
    if (request.headers?.['content-type']) {
      headers['Content-Type'] = request.headers['content-type'];
    }
    
    return headers;
  }

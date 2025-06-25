import { JwtService } from '@fugata/shared';

// Create a singleton instance for the checkout service
const jwtService = new JwtService(
  process.env.JWT_SECRET || 'your-secret-key',
  'fugata-checkout',
  ['payments:read', 'payments:write']
);

export { jwtService }; 
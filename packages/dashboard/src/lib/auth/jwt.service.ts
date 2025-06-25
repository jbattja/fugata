import { JwtService } from '@fugata/shared';

// Create a singleton instance for the checkout service
const jwtService = new JwtService(
  process.env.JWT_SECRET || 'your-secret-key',
  'fugata-dashboard',
  ['users:read', 'users:validate']
);

export { jwtService }; 
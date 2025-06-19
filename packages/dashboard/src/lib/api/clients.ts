import { PaymentDataClient, SettingsClient } from '@fugata/shared';
import { JwtService } from '../auth/jwt.service';

// Create a singleton instance of the clients
const jwtService = new JwtService(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
const settingsClient = new SettingsClient(process.env.SETTINGS_SERVICE_URL || 'http://localhost:3000');
const paymentDataClient = new PaymentDataClient(process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3001');

export async function getAuthHeaders(session: any, service: string, merchantId?: string): Promise<Record<string, string>> {
    if (!session?.user) {
        throw new Error('User not authenticated');
      }
  
      const serviceToken = jwtService.generateServiceToken(
        {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          merchantIds: session.user.merchantIds,
          role: session.user.role
        },
        service,
        merchantId
      );
  
      return {
        'Authorization': `Bearer ${serviceToken}`,
        'X-Service-Token': 'true',
        'Content-Type': 'application/json'
      };
}

export async function getAuthHeadersForServiceAccount(): Promise<Record<string, string>> {
    const serviceToken = jwtService.generateServiceAccountToken();
    return {
        'Authorization': `Bearer ${serviceToken}`,
        'X-Service-Token': 'true',
        'Content-Type': 'application/json'
    };
}


export { settingsClient,paymentDataClient }; 
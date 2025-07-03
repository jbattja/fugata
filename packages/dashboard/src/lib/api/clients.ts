import { PaymentDataClient, SettingsClient } from '@fugata/shared';
import { jwtService } from '../auth/jwt.service';
import { createMerchantHeaders } from './merchant-context';

// Create a singleton instance of the clients
const settingsClient = new SettingsClient(process.env.SETTINGS_SERVICE_URL || 'http://localhost:3000');
const paymentDataClient = new PaymentDataClient(process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3001');

async function getAuthHeadersInternal(session: any, merchantId?: string, merchantCode?: string): Promise<Record<string, string>> {
    if (!session?.user) {
        throw new Error('User not authenticated');
      }
  
      const serviceToken = jwtService.generateDashboardUserServiceToken(
        {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          merchantIds: session.user.merchantIds,
          role: session.user.role
        },
        'dashboard', // TODO: probably get rid of this parameter in the JWT 
        merchantId,
        merchantCode
      );
  
      return {
        'Authorization': `Bearer ${serviceToken}`,
        'X-Service-Token': 'true',
        'Content-Type': 'application/json'
      };
}

export async function getAuthHeaders(session: any, merchant?: any): Promise<Record<string, string>> {
    // Handle both Merchant objects and MerchantContext objects
    let merchantId: string | undefined;
    let merchantCode: string | undefined;
    
    if (merchant) {
        // If it's a MerchantContext object (from API routes)
        if ('merchantId' in merchant && 'merchantCode' in merchant) {
            merchantId = merchant.merchantId;
            merchantCode = merchant.merchantCode;
        }
        // If it's a Merchant object (from frontend)
        else if ('id' in merchant && 'accountCode' in merchant) {
            merchantId = merchant.id;
            merchantCode = merchant.accountCode;
        }
    }
    
    const authHeaders = await getAuthHeadersInternal(session, merchantId, merchantCode);
    if (!merchant) {
        return authHeaders;
    }
    const merchantHeaders = createMerchantHeaders(merchant);
    
    return {
        ...authHeaders,
        ...merchantHeaders
    };
}

export { settingsClient,paymentDataClient }; 
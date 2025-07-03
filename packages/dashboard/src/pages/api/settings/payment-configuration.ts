import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient, getAuthHeaders } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getMerchantContextFromRequest } from '@/lib/api/merchant-context';
import { handleApiError } from '@/lib/api/api-caller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const merchantContext = getMerchantContextFromRequest(req);
  
  if (!merchantContext) {
    return res.status(400).json({ error: 'Merchant context required' });
  }
  
  try {
    switch (req.method) {
      case 'GET': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const merchant = await settingsClient.getMerchant(authHeaders, merchantContext.merchantId);
        res.status(200).json(merchant.paymentConfigurations || []);
        break;
      }
      case 'POST': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        // This would need to be implemented in the settings service
        // For now, we'll return an error
        res.status(501).json({ error: 'Payment configuration creation not yet implemented' });
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error: any) {
    handleApiError(error, 'payment configuration', res);
  }
} 
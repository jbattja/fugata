import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient, getAuthHeaders } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { SharedLogger } from '@fugata/shared';
import { getMerchantContextFromRequest } from '@/lib/api/merchant-context';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const merchantContext = getMerchantContextFromRequest(req);
  
  try {
    switch (req.method) {
      case 'GET': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const payments = await paymentDataClient.listPaymentRequests(authHeaders);
        res.status(200).json(payments);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error) {
    SharedLogger.error('Error fetching payments:', error as any, handler.name);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
} 
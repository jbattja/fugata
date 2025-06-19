import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient, getAuthHeaders } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session, 'payment-data');
  try {
    switch (req.method) {
      case 'GET':
        const payments = await paymentDataClient.listPaymentRequests(authHeaders);
        res.status(200).json(payments);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
  
    }
  } catch (error) {
    console.error('Error fetching payments:', (error as any).message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
} 
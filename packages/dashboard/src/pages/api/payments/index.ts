import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient } from '@/lib/api/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const payments = await paymentDataClient.listPaymentRequests();
        res.status(200).json(payments);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
  
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
} 
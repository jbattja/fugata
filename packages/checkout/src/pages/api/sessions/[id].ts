import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient } from '@/lib/api/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const session = await paymentDataClient.getPaymentSession(id as string);
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
} 
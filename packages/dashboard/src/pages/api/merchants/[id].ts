import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session, 'payment-data');

  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const merchant = await settingsClient.getMerchant(authHeaders, id as string);
    res.status(200).json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', (error as any).message);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
} 
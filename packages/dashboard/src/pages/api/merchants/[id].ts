import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient } from '@/lib/api/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const merchant = await settingsClient.getMerchant(id as string);
    res.status(200).json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
} 
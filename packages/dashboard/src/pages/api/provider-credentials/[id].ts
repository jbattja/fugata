import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient } from '@/lib/api/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const providerCredential = await settingsClient.getProviderCredential(id as string);
    res.status(200).json(providerCredential);
  } catch (error) {
    console.error('Error fetching provider credential:', error);
    res.status(500).json({ error: 'Failed to fetch provider credential' });
  }
} 
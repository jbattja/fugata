import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { Logger } from '@nestjs/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session);

  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const configurations = await settingsClient.getPaymentConfigurationsByMerchantId(authHeaders, id as string);
    res.status(200).json(configurations);
  } catch (error) {
    Logger.error('Error fetching payment configurations for merchant:', (error as any).message, handler.name);
    res.status(500).json({ error: 'Failed to fetch payment configurations for merchant' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient } from '@/lib/api/clients';
import { Logger } from '@nestjs/common';
import { jwtService } from '@/lib/auth/jwt.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const session = await paymentDataClient.getPaymentSession(jwtService.getAuthHeadersForServiceAccount(), id as string);
    res.status(200).json(session);
  } catch (error) {
    Logger.error('Error fetching session:', (error as any).response, handler.name);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
} 
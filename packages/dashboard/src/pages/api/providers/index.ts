import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { Logger } from '@nestjs/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session, 'payment-data');

  try {
    switch (req.method) {
      case 'GET': {
        const providers = await settingsClient.listProviders(authHeaders);
        res.status(200).json(providers);
        break;
      }
      case 'POST': {
        const { accountCode, description, settings } = req.body;
        if (!accountCode) {
          return res.status(400).json({ error: 'Account code is required' });
        }
        const provider = await settingsClient.createProvider(authHeaders, accountCode, description, settings);
        res.status(201).json(provider);
        break;
      }
      case 'PUT': {
        const { id, ...updates } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Provider ID is required' });
        }
        const updatedProvider = await settingsClient.updateProvider(authHeaders, id, updates);
        res.status(200).json(updatedProvider);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error: any) {
    if (error.response && error.response.status == 400) {
      res.status(400).json(error.response.data);
    } else {
      Logger.error('Error handling provider request:', (error as any).message, handler.name);
      res.status(500).json({ error: 'Failed to process provider request' });
    }
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { handleApiError } from '@/lib/api/api-caller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session);
  try {
    switch (req.method) {
      case 'GET': {
        const merchants = await settingsClient.listMerchants(authHeaders);
        res.status(200).json(merchants);
        break;
      }
      case 'POST': {
        const { accountCode, description, settings } = req.body;
        if (!accountCode) {
          return res.status(400).json({ error: 'Account code is required' });
        }
        const newMerchant = await settingsClient.createMerchant(authHeaders, accountCode, description, settings);
        res.status(201).json(newMerchant);
        break;
      }
      case 'PUT': {
        const { id, ...updates } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Merchant ID is required' });
        }
        const updatedMerchant = await settingsClient.updateMerchant(authHeaders, id, updates);
        res.status(200).json(updatedMerchant);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  }
  } catch (error: any) {
    handleApiError(error, 'merchant', res);
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { settingsApiClient } from '@/lib/api/settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const merchants = await settingsApiClient.merchants.listMerchants();
        res.status(200).json(merchants);
        break;

      case 'POST':
        const { name, merchantCode, settings } = req.body;
        if (!name || !merchantCode) {
          return res.status(400).json({ error: 'Name and merchant code are required' });
        }
        const newMerchant = await settingsApiClient.merchants.createMerchant(name, merchantCode, settings);
        res.status(201).json(newMerchant);
        break;

      case 'PUT':
        const { id, ...updates } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Merchant ID is required' });
        }
        const updatedMerchant = await settingsApiClient.merchants.updateMerchant(id, updates);
        res.status(200).json(updatedMerchant);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error: any) {
    if (error.response.status == 400) {
      res.status(400).json(error.response.data);
    } else {
      console.error('Error handling merchant request:', error);
      res.status(500).json({ error: 'Failed to process merchant request' });
    }
  }
} 
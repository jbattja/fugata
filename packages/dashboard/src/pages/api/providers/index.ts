import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient } from '@/lib/api/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const providers = await settingsClient.listProviders();
        res.status(200).json(providers);
        break;

      case 'POST':
        const { name, providerCode, settings } = req.body;
        if (!name || !providerCode) {
          return res.status(400).json({ error: 'Name and provider code are required' });
        }
        const provider = await settingsClient.createProvider(name, providerCode, settings);
        res.status(201).json(provider);
        break;

        case 'PUT':
          const { id, ...updates } = req.body;
          if (!id) {
            return res.status(400).json({ error: 'Provider ID is required' });
          }
          const updatedProvider = await settingsClient.updateProvider(id, updates);
          res.status(200).json(updatedProvider);
          break;
  
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).json({ error: `Method ${req.method} not allowed` });
  
        }
      } catch (error: any) {
        if (error.response.status == 400) {
          res.status(400).json(error.response.data);
        } else {
          console.error('Error handling provider request:', error);
          res.status(500).json({ error: 'Failed to process provider request' });
        }
      }
    } 
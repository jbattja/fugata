import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { Logger } from '@nestjs/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session);

  try {
    switch (req.method) {
      case 'GET': {
        const providerCodeFromQuery = req.query?.providerCode as string | undefined;
        const providerCredentials = await settingsClient.listProviderCredentials(authHeaders, { providerCode: providerCodeFromQuery as string });
        res.status(200).json(providerCredentials);
        break;
      }
      case 'POST': {
        const { accountCode, providerCode, settings } = req.body;
        if (!accountCode || !providerCode || !settings) {
          return res.status(400).json({ error: 'Account code, provider code and settings are required' });
        }
        const providerCredential = await settingsClient.createProviderCredential(authHeaders, accountCode, providerCode, settings);
        res.status(201).json(providerCredential);
        break;
      }
      case 'PUT': {
        Logger.log("Provider Credential PUT request received", req.body, handler.name);
        const { id, ...updates } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Provider ID is required' });
        }
        const updatedProviderCredential = await settingsClient.updateProviderCredential(authHeaders, id, updates);
        res.status(200).json(updatedProviderCredential);
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
      Logger.error('Error handling provider credential request:', (error as any).message, handler.name);
      res.status(500).json({ error: 'Failed to process provider credential request' });
    }
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '@/lib/api/api-caller';

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
        const { accountCode, description, providerCode, settings } = req.body;
        if (!accountCode || !providerCode || !settings) {
          return res.status(400).json({ error: 'Account code, provider code and settings are required' });
        }
        const providerCredential = await settingsClient.createProviderCredential(authHeaders, accountCode, description, providerCode, settings);
        res.status(201).json(providerCredential);
        break;
      }
      case 'PUT': {
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
    handleApiError(error, 'provider credential', res);
  }
} 
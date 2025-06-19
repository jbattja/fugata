import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session, 'payment-data');

  try {
    switch (req.method) {
      case 'GET':
        const providerCodeFromQuery = req.query?.providerCode as string | undefined;
        const providerCredentials = await settingsClient.listProviderCredentials(authHeaders, { providerCode: providerCodeFromQuery as string });
        res.status(200).json(providerCredentials);
        break;

      case 'POST':
        const { providerCredentialCode,  providerCode, settings } = req.body;
        if (!providerCredentialCode || !providerCode || !settings) {
          return res.status(400).json({ error: 'Provider credential code, provider code and settings are required' });
        }
        const providerCredential = await settingsClient.createProviderCredential(authHeaders, providerCredentialCode, providerCode, settings  );
        res.status(201).json(providerCredential);
        break;

        case 'PUT':
          console.log("Provider Credential PUT request received", req.body);
          const { id, ...updates } = req.body;
          if (!id) {
            return res.status(400).json({ error: 'Provider ID is required' });
          }
          const updatedProviderCredential = await settingsClient.updateProviderCredential(authHeaders, id, updates);
          res.status(200).json(updatedProviderCredential);
          break;
  
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
      } catch (error: any) {
        if (error.response.status == 400) {
          res.status(400).json(error.response.data);
        } else {  
          console.error('Error handling provider credential request:', (error as any).message);
          res.status(500).json({ error: 'Failed to process provider credential request' });
        }
      }
    } 
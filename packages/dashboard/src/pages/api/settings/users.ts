import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient, getAuthHeaders } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getMerchantContextFromRequest } from '@/lib/api/merchant-context';
import { UserRole } from '@fugata/shared';
import { handleApiError } from '@/lib/api/api-caller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const merchantContext = getMerchantContextFromRequest(req);
  
  if (!merchantContext) {
    return res.status(400).json({ error: 'Merchant context required' });
  }
  
  try {
    switch (req.method) {
      case 'GET': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const users = await settingsClient.findUsersByMerchantId(authHeaders, merchantContext.merchantId);
        res.status(200).json(users);
        break;
      }
      case 'POST': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const { username, email, password } = req.body;
        const newUser = await settingsClient.createUser(authHeaders, username, email, password, UserRole.USER, [merchantContext.merchantId]);
        res.status(201).json(newUser);
        break;
      }
      case 'DELETE': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const user = await settingsClient.deactivateUser(authHeaders, req.body);
        res.status(200).json(user);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error: any) {
    handleApiError(error, 'users', res);
  }
} 
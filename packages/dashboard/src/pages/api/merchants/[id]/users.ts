import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthHeaders, settingsClient } from '@/lib/api/clients';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { Logger } from '@nestjs/common';
import { UserRole } from '@fugata/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const authHeaders = await getAuthHeaders(session);

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET': {
        const users = await settingsClient.findUsersByMerchantId(authHeaders, id as string);
        res.status(200).json(users);
        break;
      }
      case 'POST': {
        const user = await settingsClient.createUser(authHeaders, req.body.username, req.body.email, req.body.password, UserRole.USER, [id as string]);
        res.status(200).json(user);
        break;
      }
      case 'DELETE': {
        const user = await settingsClient.deactivateUser(authHeaders, req.body);
        res.status(200).json(user);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error: any) {
    if (error.response && error.response.status == 400) {
        res.status(400).json(error.response.data);
      } else {
        Logger.error('Error handling user request:', (error as any).message, handler.name);
        res.status(500).json({ error: 'Failed to process user request' });
      }
    }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { RedirectEncryptionUtil, SharedLogger } from '@fugata/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { encryptedAction } = req.body;

    if (!encryptedAction) {
      return res.status(400).json({ error: 'Encrypted action is required' });
    }

    // Decrypt the action on the server-side
    const action = RedirectEncryptionUtil.decryptRedirectAction(encryptedAction);

    return res.status(200).json({ action });
  } catch (error: any) {
    SharedLogger.error(`Error decrypting redirect action:`, error as any, handler.name);
    return res.status(400).json({ error: 'Failed to decrypt redirect action' });
  }
}

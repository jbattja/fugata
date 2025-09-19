import { NextApiRequest, NextApiResponse } from 'next';
import { SharedLogger } from '@fugata/shared';
import { paymentDataClient } from '@/lib/api/clients';
import { jwtService } from '@/lib/auth/jwt.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { paymentId } = req.query;

  if (!paymentId || typeof paymentId !== 'string') {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  try {
    const payment = await paymentDataClient.getPayment(jwtService.getAuthHeadersForServiceAccount(), paymentId);
    
    if (!payment.actions || payment.actions.length === 0) {
      return res.status(404).json({ error: 'No redirect actions found for this payment' });
    }

    // Find the redirect action (should be the first one)
    const redirectAction = payment.actions.find(a => a.actionType === 'REDIRECT');
    if (!redirectAction) {
      return res.status(404).json({ error: 'No redirect action found for this payment' });
    }

    return res.status(200).json({ action: redirectAction });
  } catch (error: any) {
    if (error.response && error.response.status == 400) {
      res.status(400).json(error.response.data);
    } else {
      SharedLogger.error(`Error fetching payment redirect action:`, error as any, handler.name);
      res.status(500).json({ error: 'Failed to fetch payment redirect action' });
    }
  }
}

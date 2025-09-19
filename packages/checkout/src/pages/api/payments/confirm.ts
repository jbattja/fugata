import { NextApiRequest, NextApiResponse } from 'next';
import { paymentProcessorClient } from '@/lib/api/clients';
import { jwtService } from '@/lib/auth/jwt.service';
import { SharedLogger } from '@fugata/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, partnerName, urlParams } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Call the payment processor to confirm the payment
    const confirmedPayment = await paymentProcessorClient.confirmPayment(
      jwtService.getAuthHeadersForServiceAccount(),
      paymentId,
      partnerName,
      urlParams || {}
    );

    return res.status(200).json(confirmedPayment);
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      return res.status(400).json(error.response.data);
    } else {
      SharedLogger.error(`Error confirming payment:`, error as any, handler.name);
      return res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }
}

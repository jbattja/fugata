import { NextApiRequest, NextApiResponse } from 'next';
import { paymentDataClient, paymentProcessorClient } from '@/lib/api/clients';
import { jwtService } from '@/lib/auth/jwt.service';
import { SharedLogger, SessionStatus } from '@fugata/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const session = await paymentDataClient.getPaymentSession(jwtService.getAuthHeadersForServiceAccount(), id as string);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(200).json(session);
    } catch (error: any) {
      if (error.response && error.response.status == 400) {
        res.status(400).json(error.response.data);
      } else {
        SharedLogger.error(`Error fetching session:`, error as any, handler.name);
        res.status(500).json({ error: 'Failed to fetch session' });
      }
    }
  } else if (req.method === 'POST') {
    try {
      // Extract session data and payment instrument from the request body
      const { paymentInstrument, sessionData } = req.body;
      
      // Validate session data exists
      if (!sessionData) {
        return res.status(400).json({ error: 'Session data is required' });
      }

      // Check if session is expired before processing payment
      if (sessionData.status === SessionStatus.EXPIRED) {
        return res.status(410).json({ 
          error: 'Cannot process payment for expired session',
          status: SessionStatus.EXPIRED,
          expiresAt: sessionData.expiresAt
        });
      }

      // Check if session has expired but status hasn't been updated yet
      if (sessionData.expiresAt && sessionData.expiresAt < new Date()) {
        return res.status(410).json({ 
          error: 'Cannot process payment for expired session',
          status: SessionStatus.EXPIRED,
          expiresAt: sessionData.expiresAt
        });
      }
      
      // Create payment from session using the client method
      const paymentData = paymentProcessorClient.createPaymentFromSession(sessionData, paymentInstrument);
      
      // Create the payment
      const payment = await paymentProcessorClient.createPayment(
        jwtService.getAuthHeadersForServiceAccountWithMerchant(sessionData.merchant.id, sessionData.merchant.accountCode), 
        paymentData
      );
      res.status(201).json(payment);
    } catch (error: any) {
      if (error.response && error.response.status == 400) {
        SharedLogger.error(`Error creating payment:`, error.response.data, handler.name);
        res.status(400).json(error.response.data);
      } else {
        SharedLogger.error(`Error creating payment:`, error as any, handler.name);
        res.status(500).json({ message: `Failed to create payment` });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 
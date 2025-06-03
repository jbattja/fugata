import { NextApiRequest, NextApiResponse } from 'next';
import { paymentsApi } from '@/lib/api/payments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await paymentsApi.get('/payment-requests');
    console.log('Payment data response:', response.data);
    
    // Return the data array from the response
    const payments = response.data.data || [];
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { settingsClient, getAuthHeaders } from '@/lib/api/clients';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getMerchantContextFromRequest } from '@/lib/api/merchant-context';
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
        const { paymentConfigurationId } = req.query;
        
        if (!paymentConfigurationId || typeof paymentConfigurationId !== 'string') {
          return res.status(400).json({ error: 'Payment configuration ID is required' });
        }
        
        const routingRules = await settingsClient.getRoutingRulesByConfiguration(
          authHeaders, 
          paymentConfigurationId
        );
        res.status(200).json(routingRules);
        break;
      }
      case 'POST': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const { paymentConfigurationId, providerCredentialCode, paymentMethod, weight } = req.body;
        
        if (!paymentConfigurationId || !providerCredentialCode || !paymentMethod) {
          return res.status(400).json({ 
            error: 'Payment configuration ID, provider credential code, and payment method are required' 
          });
        }
        
        const routingRule = await settingsClient.createRoutingRule(
          authHeaders,
          paymentConfigurationId,
          providerCredentialCode,
          paymentMethod,
          weight || 1.0
        );
        res.status(201).json(routingRule);
        break;
      }
      case 'PUT': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const { id, ...updates } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Routing rule ID is required' });
        }
        
        const updatedRule = await settingsClient.updateRoutingRule(
          authHeaders, 
          id, 
          updates
        );
        res.status(200).json(updatedRule);
        break;
      }
      case 'DELETE': {
        const authHeaders = await getAuthHeaders(session, merchantContext);
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Routing rule ID is required' });
        }
        
        await settingsClient.deleteRoutingRule(authHeaders, id);
        res.status(204).end();
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
      }
    }
  } catch (error: any) {
    handleApiError(error, 'routing rule', res);
  }
}

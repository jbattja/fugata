import { NextApiRequest } from 'next';
import { Merchant } from '@fugata/shared';

export interface MerchantContext {
  merchantId: string;
  merchantCode: string;
}

export function getMerchantContextFromRequest(req: NextApiRequest): MerchantContext | null {
  // Try to get merchant context from headers first (preferred)
  const merchantId = req.headers['x-merchant-id'] as string;
  const merchantCode = req.headers['x-merchant-code'] as string;
  
  if (merchantId && merchantCode) {
    return { merchantId, merchantCode };
  }
  
  // Fallback to query parameters
  const queryMerchantId = req.query.merchantId as string;
  const queryMerchantCode = req.query.merchantCode as string;
  
  if (queryMerchantId && queryMerchantCode) {
    return { merchantId: queryMerchantId, merchantCode: queryMerchantCode };
  }
  
  return null;
}

export function createMerchantHeaders(merchant: Merchant | null): Record<string, string> {
  if (!merchant) {
    return {};
  }
  
  return {
    'x-merchant-id': merchant.id!,
    'x-merchant-code': merchant.accountCode,
  };
} 
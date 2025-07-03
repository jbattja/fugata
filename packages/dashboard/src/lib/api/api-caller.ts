import { Merchant } from '@fugata/shared';
import { Logger } from '@nestjs/common';
import { NextApiResponse } from 'next';

export async function callApi(
  url: string, 
  options: RequestInit = {}, 
  merchant: Merchant | null = null
): Promise<Response> {
  const headers = new Headers(options.headers);
  
  if (merchant) {
    headers.set('x-merchant-id', merchant.id!);
    headers.set('x-merchant-code', merchant.accountCode);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
} 

export function handleApiError(error: any, apiName: string, res: NextApiResponse) {
  if (error.response && error.response.status == 400) {
    res.status(400).json(error.response.data);
  } else {
    Logger.error(`Error in ${apiName}:`, (error as any).message, apiName);
    res.status(500).json({ message: `Failed to process ${apiName} request` });
  }
}

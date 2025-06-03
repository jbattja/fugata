import axios from 'axios';

export const paymentsApi = axios.create({
  baseURL: process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
}); 

export enum PaymentStatus {
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  PENDING = 'PROCESSING',
  AWAITING_PAYMENT_METHOD = 'AWAITING_PAYMENT_METHOD',
  AWAITING_CAPTURE = 'REQUIRES_CAPTURE',
  AWAITING_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  CANCELED = 'CANCELED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export interface PaymentRequest {
id: string;
amount: {
  currency: string;
  value: number;
  amount: number;
};
paymentMethod?: string;
description?: string;
reference?: string;
returnUrl?: string;
customer?: {
  id?: string;
  customerName?: string;
  customerEmail?: string;
  customerCountry?: string;
  customerLocale?: string;
};
captureMethod?: string;
providerCredentialCode?: string;
providerCode?: string;
merchantCode?: string;
providerReference?: string;
status: PaymentStatus;
failureReason?: string;
created?: string;
nextActionDetails?: {
  type: string;
  url: string;
};
metadata?: Record<string, any>;
fugataReference?: string;
} 
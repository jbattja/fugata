import 'reflect-metadata';
import { SettingsClient } from './clients/settings.client';
import { PaymentDataClient } from './clients/payment-data.client';
import { PaymentProcessorClient } from './clients/payment-processor.client';
import { PartnerCommunicatorClient } from './clients/partner-communicator.client';
import { TokenVaultClient, CreateCardTokenRequest, DecryptedCardData } from './clients/token-vault.client';

// Export classes (values)
export {
  SettingsClient, PaymentDataClient, PaymentProcessorClient, PartnerCommunicatorClient, TokenVaultClient
};

// Export types
export type { CreateCardTokenRequest, DecryptedCardData };

export * from './types/settings/accounts'; 
export * from './types/settings/account-settings';
export * from './types/settings/integrations/integration-settings';
export * from './types/settings/payment-configuration'; 
export * from './types/settings/users';
export * from './types/payment/amount';
export * from './types/payment/payment-method';
export * from './types/payment/customer';
export * from './types/payment/fugata-reference';
export * from './types/payment/payment-common';
export * from './types/payment/payment-session';
export * from './types/payment/payment';
export * from './types/payment/payment-instrument';
export * from './types/payment/authentication';
export * from './types/payment/payment-event';
export * from './types/payment/capture';

// Export authentication components
export * from './auth/service-auth.guard';
export * from './auth/jwt.service';
export * from './auth/types';

// Export utilities
export * from './utils/logger';
export * from './utils/card-validation';
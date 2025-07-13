import { AccountSettingKey, AccountSettingsConfig, ProviderCredentialSettings } from '../account-settings';
import { SharedLogger } from '../../../utils/logger';

// Type for integration-specific settings
export interface IntegrationSettings {
    partnerName: PartnerName;
    requiredSettings: AccountSettingsConfig;
}

export enum PartnerName {
    DEMO_PARTNER = 'demo-partner',
    ADYEN = 'adyen',
    STRIPE = 'stripe',
}

export enum PartnerIntegrationClass {
    ADYEN_CHECKOUT = 'adyen-checkout',
    STRIPE_PAYMENT_INTENT = 'stripe-payment-intent',
    DEMO_PARTNER = 'demo-partner',
}

export function getSettingsConfigForProviderCredential(partnerName: PartnerName): AccountSettingsConfig {
    let settingsConfig = ProviderCredentialSettings;
    if (partnerName == null) {
        throw new Error('Partner name is null');
    }
    // Get all integration settings
    const integrationSettings = [AdyenSettings, StripeSettings];

    // Find the matching integration settings
    const matchingSettings = integrationSettings.find(integration => integration.partnerName === partnerName);
    if (!matchingSettings) {
        // nothing to validate against, so no errors
        SharedLogger.warn(`No matching integration settings found for partner integration: ${partnerName}`, 'getSettingsConfigForProviderCredential');
    } else {
        settingsConfig = { ...settingsConfig, ...matchingSettings.requiredSettings };
    }
    return settingsConfig;
}

// Integration-specific settings configurations
export const AdyenSettings: IntegrationSettings = {
    partnerName: PartnerName.ADYEN,
    requiredSettings: {
      [AccountSettingKey.API_KEY]: { type: 'string', required: true },
      [AccountSettingKey.MERCHANT_ACCOUNT]: { type: 'string', required: true },
    },
};
  
export const StripeSettings: IntegrationSettings = {
    partnerName: PartnerName.STRIPE,
    requiredSettings: {
      [AccountSettingKey.SECRET_KEY]: { type: 'string', required: true },
    },
};
  
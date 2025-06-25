import { Logger } from '@nestjs/common';
import { AccountSettingKey, AccountSettingsConfig, ProviderCredentialSettings } from '../account-settings';

// Type for integration-specific settings
export interface IntegrationSettings {
    providerCode: string;
    requiredSettings: AccountSettingsConfig;
}  

export function getSettingsConfigForProviderCredential(providerCode: string): AccountSettingsConfig {
    let settingsConfig = ProviderCredentialSettings;
    if (providerCode == null) {
        throw new Error('Provider code is null');
    }
    // Get all integration settings
    const integrationSettings = [AdyenSettings, StripeSettings];

    // Find the matching integration settings
    const matchingSettings = integrationSettings.find(integration => integration.providerCode.toLowerCase() === providerCode.toLowerCase());
    if (!matchingSettings) {
        // nothing to validate against, so no errors
        Logger.warn(`No matching integration settings found for provider code: ${providerCode}`, getSettingsConfigForProviderCredential.name);
    } else {
        settingsConfig = { ...settingsConfig, ...matchingSettings.requiredSettings };
    }
    return settingsConfig;
}

// Integration-specific settings configurations
export const AdyenSettings: IntegrationSettings = {
    providerCode: 'adyen',
    requiredSettings: {
      [AccountSettingKey.API_KEY]: { type: 'string', required: true },
      [AccountSettingKey.MERCHANT_ACCOUNT]: { type: 'string', required: true },
    },
};
  
export const StripeSettings: IntegrationSettings = {
    providerCode: 'stripe',
    requiredSettings: {
      [AccountSettingKey.SECRET_KEY]: { type: 'string', required: true },
    },
};
  
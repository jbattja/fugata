import { ValidationError } from 'class-validator';
import { MerchantSettings, ProviderSettings, AccountSettingsConfig } from './account-settings';
import { getSettingsConfigForProviderCredential } from './integrations/integration-settings';

export enum AccountType {
  PROVIDER_CREDENTIAL = 'providerCredential',
  MERCHANT = 'merchant',
  PROVIDER = 'provider',
}

export abstract class Account {
  id: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderCredential extends Account {
  providerCredentialCode: string;
  provider: Provider;
  isActive: boolean;
}

export interface Merchant extends Account {
  name: string;
  merchantCode: string;
  providersCredentials: ProviderCredential[];
  availablePaymentChannels: RoutingRule[];
} 

export interface Provider extends Account {
  name: string;
  providerCode: string;
  providerCredentials: ProviderCredential[];
} 

export interface RoutingRule {
  id: string;
  merchant: Merchant;
  providerCredential: ProviderCredential;
  conditions: Record<string, any>;
  weight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function validateAccountSettings(account: Account, accountType: AccountType): ValidationError[] {
  const errors: ValidationError[] = [];
  const settings = getSettings(account, accountType);
  let settingsConfig: AccountSettingsConfig;
  if (accountType === AccountType.PROVIDER_CREDENTIAL) {
    const providerCredential = account as ProviderCredential;
    if (providerCredential.provider == null || providerCredential.provider.providerCode == null) {
      throw new Error('Provider is null');
    }
    const providerCode = providerCredential.provider.providerCode;
    settingsConfig = getSettingsConfig(accountType, providerCode);
  } else {
    settingsConfig = getSettingsConfig(accountType, null);
  }

  // Check for required settings
  Object.entries(settingsConfig).forEach(([key, metadata]) => {
    if (metadata.required && !settings[key]) {
      errors.push({
        property: key,
        constraints: {
          required: `${key} is required for this account type`
        }
      });
    }
  });

  // Validate all provided settings
  Object.entries(settings).forEach(([key, value]) => {
    // Check if the setting is allowed for this account type
    const metadata = settingsConfig[key as keyof typeof settingsConfig];
    if (!metadata) {
      errors.push({
        property: key,
        constraints: {
          invalid: `${key} is not a valid setting for this account type`
        }
      });
      return;
    }

    // Validate type
    const expectedType = metadata.type;
    const actualType = typeof value;
    
    if (expectedType === 'boolean' && actualType !== 'boolean') {
      errors.push({
        property: key,
        constraints: {
          type: `${key} must be a boolean value`
        }
      });
    } else if (expectedType === 'string' && actualType !== 'string') {
      errors.push({
        property: key,
        constraints: {
          type: `${key} must be a string value`
        }
      });
    }
  });

  return errors;
}

export function getSettingsConfig(accountType: AccountType, parentAccountCode: string | null): AccountSettingsConfig {
  // Get the settings configuration based on the account type
  let settingsConfig: AccountSettingsConfig;
  if (accountType === AccountType.PROVIDER_CREDENTIAL) {
    if (parentAccountCode == null) {
      throw new Error('Parent account code is null');
    }
    settingsConfig = getSettingsConfigForProviderCredential(parentAccountCode);
  } else if (accountType === AccountType.MERCHANT) {
    settingsConfig = MerchantSettings;
  } else if (accountType === AccountType.PROVIDER) {
    settingsConfig = ProviderSettings;
  } else {
    throw new Error('Unknown account type');
  }
  return settingsConfig;
}

export function getSettings(account: Account, accountType: AccountType): Record<string, any> {
  let settings = account.settings;
  if (account.settings == null) {
    settings = {};
  }
  if (accountType === AccountType.PROVIDER_CREDENTIAL) {
    const provider = (account as ProviderCredential).provider;
    if (provider == null) {
      throw new Error('Provider is null');
    }
    settings = getCombinedSettings(account as ProviderCredential, provider);
  }
  return settings;
}

export function getCombinedSettings(parentAccount: Account, childAccount: Account): Record<string, any> {
  let combinedSettings: Record<string, any> = {};
  if (parentAccount.settings != null) {
    combinedSettings = { ...parentAccount.settings };
  }
  if (childAccount.settings != null) {
    combinedSettings = {...combinedSettings, ...childAccount.settings };
  }
  return combinedSettings;
}

// Type guards
export function isProvider(obj: any): obj is Provider {
    return obj && 'providerCode' in obj;
}

  export function isMerchant(obj: any): obj is Merchant {
      return obj && 'merchantCode' in obj;
  }

  export function isProviderCredential(obj: any): obj is ProviderCredential {
      return obj && 'providerCredentialCode' in obj;
  }

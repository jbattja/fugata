import { IsDate, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested, ValidationError } from 'class-validator';
import { MerchantSettings, ProviderSettings, AccountSettingsConfig } from './account-settings';
import { getSettingsConfigForProviderCredential, PartnerName } from './integrations/integration-settings';
import { Type } from 'class-transformer';

export enum AccountType {
  PROVIDER_CREDENTIAL = 'providerCredential',
  MERCHANT = 'merchant',
  PROVIDER = 'provider',
}

export enum AccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
}

export abstract class Account {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  accountCode!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status!: AccountStatus;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  static addSetting(account: Account, key: string, value: any) {
    if (account.settings == null) {
      account.settings = {};
    }
    account.settings[key] = value;
  }
}

export class Merchant extends Account {
  @ValidateNested()
  @Type(() => ProviderCredential)
  @IsOptional()
  providersCredentials?: ProviderCredential[];

  @ValidateNested({ each: true })
  @Type(() => require('./payment-configuration').PaymentConfiguration)
  @IsNotEmpty()
  paymentConfigurations!: any[];
} 

export class Provider extends Account {
  @ValidateNested()
  @Type(() => ProviderCredential)
  @IsOptional()
  providerCredentials?: ProviderCredential[];
} 

export class ProviderCredential extends Account {
  @ValidateNested()
  @Type(() => Provider)
  @IsNotEmpty()
  provider!: Provider;
}

export function validateAccountSettings(account: Account, accountType: AccountType): ValidationError[] {
  const errors: ValidationError[] = [];
  const settings = getSettings(account, accountType);
  let settingsConfig: AccountSettingsConfig;
  if (accountType === AccountType.PROVIDER_CREDENTIAL) {
    const providerCredential = account as ProviderCredential;
    if (!providerCredential.provider?.accountCode) {
      throw new Error('Provider code is required');
    }
    settingsConfig = getSettingsConfig(accountType, providerCredential.provider.accountCode);
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
    let actualType = typeof value;
    let convertedValue = value;

    // Convert string values to their expected type if possible
    if (actualType === 'string') {
      if (expectedType === 'number') {
        const num = Number(value);
        if (!isNaN(num)) {
          convertedValue = num;
          actualType = 'number';
        }
      } else if (expectedType === 'boolean') {
        if (value.toLowerCase() === 'true') {
          convertedValue = true;
          actualType = 'boolean';
        } else if (value.toLowerCase() === 'false') {
          convertedValue = false;
          actualType = 'boolean';
        }
      }
    }
    
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
    } else if (expectedType === 'number') {
      if (actualType !== 'number') {
        errors.push({
          property: key,
          constraints: {
            type: `${key} must be a number`
          }
        });
      } else {
        // Validate min/max constraints for numbers
        if (metadata.min !== undefined && convertedValue < metadata.min) {
          errors.push({
            property: key,
            constraints: {
              min: `${key} must be at least ${metadata.min}`
            }
          });
        }
        if (metadata.max !== undefined && convertedValue > metadata.max) {
          errors.push({
            property: key,
            constraints: {
              max: `${key} must be at most ${metadata.max}`
            }
          });
        }
      }
    }

    // Validate string length constraints
    if (expectedType === 'string' && actualType === 'string') {
      if (metadata.min !== undefined && convertedValue.length < metadata.min) {
        errors.push({
          property: key,
          constraints: {
            minLength: `${key} must be at least ${metadata.min} characters`
          }
        });
      }
      if (metadata.max !== undefined && convertedValue.length > metadata.max) {
        errors.push({
          property: key,
          constraints: {
            maxLength: `${key} must be at most ${metadata.max} characters`
          }
        });
      }
    }

    // Validate pattern if specified
    if (expectedType === 'string' && actualType === 'string' && metadata.pattern) {
      const regex = new RegExp(metadata.pattern);
      if (!regex.test(convertedValue)) {
        errors.push({
          property: key,
          constraints: {
            pattern: `${key} must match the pattern ${metadata.pattern}`
          }
        });
      }
    }

    // Update the value in the settings object with the converted value
    if (actualType === expectedType) {
      Account.addSetting(account, key, convertedValue);
    }
  });

  return errors;
}

export function getSettingsConfig(accountType: AccountType, providerCode: string | null): AccountSettingsConfig {
  // Get the settings configuration based on the account type
  let settingsConfig: AccountSettingsConfig;
  if (accountType === AccountType.PROVIDER_CREDENTIAL) {
    if (providerCode == null || !Object.values(PartnerName).includes(providerCode as PartnerName)) {
      throw new Error('Provider code is null or invalid, valid options are: ' + Object.values(PartnerName).join(', '));
    }
    const partnerName = providerCode as PartnerName;
    settingsConfig = getSettingsConfigForProviderCredential(partnerName);
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
  if (settings == null) {
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

export function getCombinedSettings(childAccount: Account, parentAccount: Account): Record<string, any> {
  let combinedSettings: Record<string, any> = {};
  if (parentAccount.settings != null) {
    combinedSettings = { ...parentAccount.settings };
  }
  if (childAccount.settings != null) {
    combinedSettings = {...combinedSettings, ...childAccount.settings };
  }
  return combinedSettings;
}

/**
 * Deduplicates settings between a provider credential and its provider.
 * Removes settings from the provider credential that are identical to the provider's settings,
 * keeping only the delta (settings that differ or are unique to the credential).
 * 
 * Example:
 * Provider settings: { apiKey: "shared-key", environment: "production" }
 * Credential settings: { apiKey: "shared-key", environment: "production", merchantId: "merchant-123" }
 * Result: { merchantId: "merchant-123" } (only the delta remains)
 * 
 * This ensures that:
 * 1. Shared settings are stored only at the provider level
 * 2. Provider credentials only store their unique overrides
 * 3. Storage is optimized by avoiding duplication
 * 4. When reading settings, getCombinedSettings() merges them back together
 * 
 * @param providerCredential The provider credential account
 * @returns The provider credential with deduplicated settings (only delta remains)
 */
export function deduplicateProviderCredentialSettings(providerCredential: ProviderCredential): ProviderCredential {
  if (!providerCredential.provider) {
    throw new Error('Provider is required for deduplication');
  }

  const provider = providerCredential.provider;
  const credentialSettings = providerCredential.settings || {};
  const providerSettings = provider.settings || {};
  
  // Create a copy of the provider credential to avoid mutating the original
  const deduplicatedCredential = { ...providerCredential };
  deduplicatedCredential.settings = { ...credentialSettings };

  // Remove settings from credential that are identical to provider settings
  Object.keys(deduplicatedCredential.settings || {}).forEach(key => {
    const credentialValue = deduplicatedCredential.settings![key];
    const providerValue = providerSettings[key];
    // Remove if both key and value are identical
    if (providerValue !== undefined && JSON.stringify(credentialValue) === JSON.stringify(providerValue)) {
      delete deduplicatedCredential.settings![key];
    }
  });

  // If all settings were removed, set to empty object
  if (Object.keys(deduplicatedCredential.settings || {}).length === 0) {
    deduplicatedCredential.settings = {};
  }

  return deduplicatedCredential;
}

/**
 * Validates and deduplicates provider credential settings before saving.
 * This ensures that only the delta is stored on the provider credential.
 * 
 * @param providerCredential The provider credential to validate and deduplicate
 * @returns The validated and deduplicated provider credential
 */
export function validateAndDeduplicateProviderCredential(providerCredential: ProviderCredential): ProviderCredential {
  // First validate the settings
  const validationErrors = validateAccountSettings(providerCredential, AccountType.PROVIDER_CREDENTIAL);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map(error => 
      `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`
    ).join('; ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  // Then deduplicate the settings
  return deduplicateProviderCredentialSettings(providerCredential);
}

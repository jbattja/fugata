import { IsDate, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested, ValidationError } from 'class-validator';
import { MerchantSettings, ProviderSettings, AccountSettingsConfig } from './account-settings';
import { getSettingsConfigForProviderCredential } from './integrations/integration-settings';
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
    if (providerCredential.provider == null || providerCredential.provider.accountCode == null) {
      throw new Error('Provider is null');
    }
    const providerCode = providerCredential.provider.accountCode;
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

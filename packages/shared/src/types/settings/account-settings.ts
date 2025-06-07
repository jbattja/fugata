// Enum for all possible settings
export enum AccountSettingKey {
  API_KEY = 'apiKey',
  SECRET_KEY = 'secretKey',
  MERCHANT_ACCOUNT = 'merchantAccount',
  ALLOW_SKIP_3DS = 'allowSkip3DS',
  ALLOW_SKIP_RISK = 'allowSkipRisk',
  MCC = 'mcc',
}

// Type for setting value types
export type SettingValueType = string | boolean;

// Interface for setting metadata
export interface SettingMetadata {
  type: 'string' | 'boolean';
  required: boolean;
  defaultValue?: SettingValueType;
}

// Type for settings configuration per account type
export type AccountSettingsConfig = {
  [K in AccountSettingKey]?: SettingMetadata;
};

// Required settings per account type
export const ProviderCredentialSettings: AccountSettingsConfig = {
  [AccountSettingKey.API_KEY]: { type: 'string', required: false },
  [AccountSettingKey.SECRET_KEY]: { type: 'string', required: false },
  [AccountSettingKey.MERCHANT_ACCOUNT]: { type: 'string', required: false },
  [AccountSettingKey.MCC]: { type: 'string', required: false },
};

export const MerchantSettings: AccountSettingsConfig = {
  [AccountSettingKey.MCC]: { type: 'string', required: true },
  [AccountSettingKey.ALLOW_SKIP_3DS]: { type: 'boolean', required: false, defaultValue: false },
  [AccountSettingKey.ALLOW_SKIP_RISK]: { type: 'boolean', required: false, defaultValue: false },
};

export const ProviderSettings: AccountSettingsConfig = {
    [AccountSettingKey.API_KEY]: { type: 'string', required: false },
};

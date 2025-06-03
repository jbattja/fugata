
export interface ProviderCredential {
  id: string;
  providerCredentialCode: string;
  provider: Provider;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
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

export interface Merchant {
  id: string;
  name: string;
  merchantCode: string;
  providersCredentials: ProviderCredential[];
  availablePaymentChannels: RoutingRule[];
  createdAt: Date;
  updatedAt: Date;
} 

export interface Provider {
  id: string;
  name: string;
  providerCode: string;
  defaultSettings: Record<string, any>;
  providerCredentials: ProviderCredential[];
  createdAt: Date;
  updatedAt: Date;
} 
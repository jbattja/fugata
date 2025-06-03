import axios from 'axios';

const settingsApi = axios.create({
  baseURL: process.env.SETTINGS_SERVICE_URL || 'http://localhost:3000',
});

export interface User {
  id: string;
  username: string;
  email: string;
  merchantIds: string[];
  role: 'admin' | 'user';
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

export interface ProviderCredential {
  id: string;
  providerCredentialCode: string;
  provider: Provider;
  providerId: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 

export interface Merchant {
  id: string;
  name: string;
  merchantCode: string;
  providerCredentials: ProviderCredential[];
  routingRules: RoutingRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutingRule {
  id: string;
  merchant: Merchant;
  merchantId: string;
  providerCredential: ProviderCredential;
  providerCredentialId: string;
  conditions: Record<string, any>;
  weight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 

export const settingsApiClient = {
  users: {
    findByUsername: async (username: string): Promise<User | null> => {
      const response = await settingsApi.get(`/users/${username}`);
      return response.data;
    },
    validatePassword: async (username: string, password: string): Promise<boolean> => {
      const response = await settingsApi.post('/users/validate-password', {
        username,
        password,
      });
      return response.data;
    },
  },
  merchants: {
    listMerchants: async (): Promise<Merchant[]> => {
      const response = await settingsApi.get('settings/merchants');
      return response.data;
    },
    createMerchant: async (name: string, merchantCode: string): Promise<Merchant> => {
      const response = await settingsApi.post('settings/merchants', { name, merchantCode });
      return response.data;
    },
    updateMerchant: async (id: string, updates: Partial<Merchant>): Promise<Merchant> => {
      const response = await settingsApi.put(`settings/merchants/${id}`, updates);
      return response.data;
    },
    getMerchant: async (id: string): Promise<Merchant> => {
      const response = await settingsApi.get(`settings/merchants/${id}`);
      return response.data;
    },
  },
  providers: {
    listProviders: async (): Promise<Provider[]> => {
      const response = await settingsApi.get('settings/providers');
      return response.data;
    },
    createProvider: async (name: string, providerCode: string): Promise<Provider> => {
      const response = await settingsApi.post('settings/providers', { name, providerCode });
      return response.data;
    },
    updateProvider: async (id: string, updates: Partial<Provider>): Promise<Provider> => {
      const response = await settingsApi.put(`settings/providers/${id}`, updates);
      return response.data;
    },
    getProvider: async (id: string): Promise<Provider> => {
      const response = await settingsApi.get(`settings/providers/${id}`);
      return response.data;
    },
  },
  providerCredentials: {
    listProviderCredentials: async (filters?: {
      providerCode?: string;
      providerId?: string;
    }): Promise<ProviderCredential[]> => {
      const response = await settingsApi.get('settings/provider-credentials', {
        params: filters,
      });
      return response.data;
    },
    createProviderCredential: async (providerCredentialCode: string, providerCode: string, settings: Record<string, string>): Promise<ProviderCredential> => {  
      const response = await settingsApi.post('settings/provider-credentials', { providerCredentialCode, providerCode, settings });
      return response.data;
    },
    updateProviderCredential: async (id: string, updates: Partial<ProviderCredential>): Promise<ProviderCredential> => {
      const response = await settingsApi.put(`settings/provider-credentials/${id}`, updates);
      return response.data;
    },
    getProviderCredential: async (id: string): Promise<ProviderCredential> => {
      const response = await settingsApi.get(`settings/provider-credentials/${id}`);
      return response.data;
    },
  },
}; 
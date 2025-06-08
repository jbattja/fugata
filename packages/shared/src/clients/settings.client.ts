import { Provider, ProviderCredential } from '../types/settings/accounts';
import axios, { AxiosInstance } from 'axios';
import { Merchant } from '../types/settings/accounts';
import { User } from '../types/settings/users';

export class SettingsClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  // Users
  async findByUsername(username: string): Promise<User | null> {
    const response = await this.httpClient.get(`/users/${username}`);
    return response.data;
  }

  async validatePassword(username: string, password: string): Promise<boolean> {
    const response = await this.httpClient.post('/users/validate-password', {
      username,
      password,
    });
    return response.data;
  }

  async getProviderCredentialForMerchant(merchantCode: string, conditions: Record<string, any>): Promise<ProviderCredential> {
    const response = await this.httpClient.get<ProviderCredential>(
      `/settings/get-credentials?merchantCode=${merchantCode}`
    );
    return response.data;
  }

  // Merchants
  async listMerchants(): Promise<Merchant[]> {
    const response = await this.httpClient.get('settings/merchants');
    return response.data;
  }

  async createMerchant(name: string, merchantCode: string, settings: Record<string, string>): Promise<Merchant> {
    const response = await this.httpClient.post('settings/merchants', { name, merchantCode });
    return response.data;
  }

  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<Merchant> {
    const response = await this.httpClient.put(`settings/merchants/${id}`, updates);
    return response.data;
  }

  async getMerchant(id: string): Promise<Merchant> {
    const response = await this.httpClient.get(`settings/merchants/${id}`);
    return response.data;
  }

  // Providers
  async listProviders(): Promise<Provider[]> {
    const response = await this.httpClient.get('settings/providers');
    return response.data;
  }

  async createProvider(name: string, providerCode: string, settings: Record<string, string>): Promise<Provider> {
    const response = await this.httpClient.post('settings/providers', { name, providerCode });
    return response.data;
  }

  async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider> {
    const response = await this.httpClient.put(`settings/providers/${id}`, updates);
    return response.data;
  }

  async getProvider(id: string): Promise<Provider> {
    const response = await this.httpClient.get(`settings/providers/${id}`);
    return response.data;
  }

  // Provider Credentials
  async listProviderCredentials(filters?: {
    providerCode?: string;
    providerId?: string;
  }): Promise<ProviderCredential[]> {
    const response = await this.httpClient.get('settings/provider-credentials', {
      params: filters,
    });
    return response.data;
  }

  async createProviderCredential(providerCredentialCode: string, providerCode: string, settings: Record<string, string>): Promise<ProviderCredential> {  
    const response = await this.httpClient.post('settings/provider-credentials', { providerCredentialCode, providerCode, settings });
    return response.data;
  }

  async updateProviderCredential(id: string, updates: Partial<ProviderCredential>): Promise<ProviderCredential> {
    const response = await this.httpClient.put(`settings/provider-credentials/${id}`, updates);
    return response.data;
  }

  async getProviderCredential(id: string): Promise<ProviderCredential> {
    const response = await this.httpClient.get(`settings/provider-credentials/${id}`);
    return response.data;
  }

} 
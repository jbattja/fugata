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
  async findByUsername(headers: Record<string, string>, username: string): Promise<User | null> {
    const response = await this.httpClient.get(`/users/${username}`, { headers: headers });
    return response.data;
  }

  async validatePassword(headers: Record<string, string>, username: string, password: string): Promise<boolean> {
    const response = await this.httpClient.post('/users/validate-password', {
      username,
      password,
    }, { headers: headers });
    return response.data;
  }

  async getProviderCredentialForMerchant(headers: Record<string, string>, merchantId: string, conditions: Record<string, any>): Promise<ProviderCredential> {
    const response = await this.httpClient.get<ProviderCredential>(
      `/settings/get-credentials?merchantId=${merchantId}`, { headers: headers }
    );
    return response.data;
  }

  // Merchants
  async listMerchants(headers: Record<string, string>): Promise<Merchant[]> {
    const response = await this.httpClient.get('settings/merchants', { headers: headers });
    return response.data;
  }

  async createMerchant(headers: Record<string, string>, name: string, merchantCode: string, settings: Record<string, string>): Promise<Merchant> {
    const response = await this.httpClient.post('settings/merchants', { name, merchantCode }, { headers: headers });
    return response.data;
  }

  async updateMerchant(headers: Record<string, string>, id: string, updates: Partial<Merchant>): Promise<Merchant> {
    const response = await this.httpClient.put(`settings/merchants/${id}`, updates, { headers: headers });
    return response.data;
  }

  async getMerchant(headers: Record<string, string>, id: string): Promise<Merchant> {
    const response = await this.httpClient.get(`settings/merchants/${id}`, { headers: headers });
    return response.data;
  }

  // Providers
  async listProviders(headers: Record<string, string>): Promise<Provider[]> {
    const response = await this.httpClient.get('settings/providers', { headers: headers });
    return response.data;
  }

  async createProvider(headers: Record<string, string>, name: string, providerCode: string, settings: Record<string, string>): Promise<Provider> {
    const response = await this.httpClient.post('settings/providers', { name, providerCode }, { headers: headers });
    return response.data;
  }

  async updateProvider(headers: Record<string, string>, id: string, updates: Partial<Provider>): Promise<Provider> {
    const response = await this.httpClient.put(`settings/providers/${id}`, updates, { headers: headers });
    return response.data;
  }

  async getProvider(headers: Record<string, string>, id: string): Promise<Provider> {
    const response = await this.httpClient.get(`settings/providers/${id}`, { headers: headers });
    return response.data;
  }

  // Provider Credentials
  async listProviderCredentials(headers: Record<string, string>, filters?: {
    providerCode?: string;
    providerId?: string;
  }): Promise<ProviderCredential[]> { 
    const response = await this.httpClient.get('settings/provider-credentials', {
      params: filters,
      headers: headers
    });
    return response.data;
  }

  async createProviderCredential(headers: Record<string, string>, providerCredentialCode: string, providerCode: string, settings: Record<string, string>): Promise<ProviderCredential> {  
    const response = await this.httpClient.post('settings/provider-credentials', { providerCredentialCode, providerCode, settings }, { headers: headers });
    return response.data;
  }

  async updateProviderCredential(headers: Record<string, string>, id: string, updates: Partial<ProviderCredential>): Promise<ProviderCredential> {
    const response = await this.httpClient.put(`settings/provider-credentials/${id}`, updates, { headers: headers });
    return response.data;
  }

  async getProviderCredential(headers: Record<string, string>, id: string): Promise<ProviderCredential> {
    const response = await this.httpClient.get(`settings/provider-credentials/${id}`, { headers: headers });
    return response.data;
  }

} 
import { Provider, ProviderCredential } from '../types/settings/accounts';
import axios, { AxiosInstance } from 'axios';
import { Merchant } from '../types/settings/accounts';
import { User } from '../types/settings/users';
import { PaymentMethod } from '../types/payment/payment-method';
import { Logger } from '@nestjs/common';

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

  async getProviderCredentialForMerchant(headers: Record<string, string>, merchantId: string, paymentMethod?: PaymentMethod): Promise<ProviderCredential | null> {
    const url = `/settings/get-credentials?merchantId=${merchantId}` + (paymentMethod ? `&paymentMethod=${paymentMethod}` : '');
    try {
      const response = await this.httpClient.get<ProviderCredential>(url, { headers: headers });
      if (response && response.status === 200) {
        return response.data;
      }
      Logger.error(`Failed to get provider credential for merchant ${merchantId} with payment method ${paymentMethod}`, SettingsClient.name);
      return null;
    } catch (error) {
      Logger.error(`Failed to get provider credential for merchant ${merchantId} with payment method ${paymentMethod}`, SettingsClient.name);
      return null;
    }
  }

  // Merchants
  async listMerchants(headers: Record<string, string>): Promise<Merchant[]> {
    const response = await this.httpClient.get('settings/merchants', { headers: headers });
    return response.data;
  }

  async createMerchant(headers: Record<string, string>, accountCode: string, description: string, settings: Record<string, string>): Promise<Merchant> {
    const response = await this.httpClient.post('settings/merchants', { accountCode, description, settings }, { headers: headers });
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

  async createProvider(headers: Record<string, string>, accountCode: string, description: string, settings: Record<string, string>): Promise<Provider> {
    const response = await this.httpClient.post('settings/providers', { accountCode, description, settings }, { headers: headers });
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

  async createProviderCredential(headers: Record<string, string>, accountCode: string, description: string, settings: Record<string, string>): Promise<ProviderCredential> {
    const response = await this.httpClient.post('settings/provider-credentials', { accountCode, description, settings }, { headers: headers });
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
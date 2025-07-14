import { Provider, ProviderCredential } from '../types/settings/accounts';
import axios, { AxiosInstance } from 'axios';
import { Merchant } from '../types/settings/accounts';
import { User, UserRole, UserStatus } from '../types/settings/users';
import { PaymentMethod } from '../types/payment/payment-method';
import { PaymentConfiguration } from '../types/settings/payment-configuration';
import { SharedLogger } from '../utils/logger';

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

  async findUsersByMerchantId(headers: Record<string, string>, merchantId: string): Promise<User[]> {
    const response = await this.httpClient.get(`/users?merchantId=${merchantId}`, { headers: headers });
    return response.data;
  }

  async createUser(headers: Record<string, string>, username: string, email: string, password: string, role: UserRole, merchantIds: string[]): Promise<User> {
    const response = await this.httpClient.post('/users', { username, email, password, role, merchantIds }, { headers: headers });
    return response.data;
  }

  async deactivateUser(headers: Record<string, string>, user: Partial<User>): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required to deactivate a user');
    }
    const updates: Partial<User> = {
      status: UserStatus.INACTIVE,
      ...user
    };
    const response = await this.httpClient.put(`/users/${user.id}`, updates, { headers: headers });
    return response.data;
  }

  async activateUser(headers: Record<string, string>, user: Partial<User>): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required to activate a user');
    }
    const updates: Partial<User> = {
      status: UserStatus.ACTIVE,
      ...user
    };
    const response = await this.httpClient.put(`/users/${user.id}`, updates, { headers: headers });
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
      SharedLogger.error(`Failed to get provider credential for merchant ${merchantId} with payment method ${paymentMethod}`, undefined, 'SettingsClient');
      return null;
    } catch (error) {
      SharedLogger.error(`Failed to get provider credential for merchant ${merchantId} with payment method ${paymentMethod}`, error as any, 'SettingsClient');
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

  async createProviderCredential(headers: Record<string, string>, accountCode: string, description: string, providerCode: string, settings: Record<string, string>): Promise<ProviderCredential> {
    const response = await this.httpClient.post('settings/provider-credentials', { accountCode, description, providerCode, settings }, { headers: headers });
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

  async getPaymentConfigurationsByMerchantId(headers: Record<string, string>, merchantId: string): Promise<PaymentConfiguration[]> {
    const response = await this.httpClient.get(`settings/payment-configurations/${merchantId}`, { headers: headers });
    return response.data;
  }

} 
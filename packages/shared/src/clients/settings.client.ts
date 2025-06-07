import { ProviderCredential } from '../types/settings/settings';
import axios, { AxiosInstance } from 'axios';

export class SettingsClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  async getProviderCredentialForMerchant(merchantCode: string, conditions: Record<string, any>): Promise<ProviderCredential> {
    const response = await this.httpClient.get<ProviderCredential>(
      `/settings/get-credentials?merchantCode=${merchantCode}`
    );
    return response.data;
  }
} 
import axios, { AxiosInstance } from 'axios';
import { PaymentMethod, CardNetwork } from '../types/payment/payment-method';

export interface CreateCardTokenRequest {
  merchantId: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  cardNetwork?: CardNetwork;
  cardNumber: string;
  cvc?: string;
  cardHolderName?: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface TokenResponse {
  token: string;
  maskedNumber: string;
  bin: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardNetwork?: CardNetwork;
  issuerName?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface DecryptTokenRequest {
  token: string;
  merchantId: string;
}

export interface DecryptedCardData {
  cardNumber: string;
  cvc?: string;
  cardHolderName?: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface BinLookupResponse {
  bin: string;
  cardNetwork: CardNetwork;
  issuerName: string;
  cardType: string;
  cardCategory: string;
  countryCode: string;
  countryName: string;
  bankName?: string;
  bankWebsite?: string;
  bankPhone?: string;
  isPrepaid: boolean;
}

export class TokenVaultClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl
    });
  }

  async createToken(headers: Record<string, string>, request: CreateCardTokenRequest): Promise<TokenResponse> {
    const response = await this.client.post('/token-vault/tokens', request, { headers });
    return response.data;
  }

  async getToken(headers: Record<string, string>, token: string, merchantId: string): Promise<TokenResponse> {
    const response = await this.client.get(`/token-vault/tokens/${token}`, {
      params: { merchantId },
      headers
    });
    return response.data;
  }

  async decryptToken(headers: Record<string, string>, request: DecryptTokenRequest): Promise<DecryptedCardData> {
    const response = await this.client.post(`/token-vault/tokens/${request.token}/decrypt`, request, { headers });
    return response.data;
  }

  async deactivateToken(headers: Record<string, string>, token: string, merchantId: string): Promise<void> {
    await this.client.delete(`/token-vault/tokens/${token}`, {
      params: { merchantId },
      headers
    });
  }

  async getTokensByCustomer(headers: Record<string, string>, customerId: string, merchantId: string): Promise<TokenResponse[]> {
    const response = await this.client.get(`/token-vault/customers/${customerId}/tokens`, {
      params: { merchantId },
      headers
    });
    return response.data;
  }

  async getTokensByMerchant(headers: Record<string, string>, merchantId: string): Promise<TokenResponse[]> {
    const response = await this.client.get(`/token-vault/merchants/${merchantId}/tokens`, { headers });
    return response.data;
  }

  async lookupBin(headers: Record<string, string>, bin: string): Promise<BinLookupResponse> {
    const response = await this.client.get(`/bin-lookup/${bin}`, { headers });
    return response.data;
  }

  async searchBins(headers: Record<string, string>, query: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get('/bin-lookup/search', {
      params: { q: query },
      headers
    });
    return response.data;
  }

  async getBinsByNetwork(headers: Record<string, string>, network: CardNetwork): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/network/${network}`, { headers });
    return response.data;
  }

  async getBinsByCountry(headers: Record<string, string>, countryCode: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/country/${countryCode}`, { headers });
    return response.data;
  }

  async getBinsByCardType(headers: Record<string, string>, cardType: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/type/${cardType}`, { headers });
    return response.data;
  }
}

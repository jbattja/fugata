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

  constructor(baseURL: string, apiKey?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });
  }

  async createToken(request: CreateCardTokenRequest): Promise<TokenResponse> {
    const response = await this.client.post('/token-vault/tokens', request);
    return response.data;
  }

  async getToken(token: string, merchantId: string): Promise<TokenResponse> {
    const response = await this.client.get(`/token-vault/tokens/${token}`, {
      params: { merchantId }
    });
    return response.data;
  }

  async decryptToken(request: DecryptTokenRequest): Promise<DecryptedCardData> {
    const response = await this.client.post(`/token-vault/tokens/${request.token}/decrypt`, request);
    return response.data;
  }

  async deactivateToken(token: string, merchantId: string): Promise<void> {
    await this.client.delete(`/token-vault/tokens/${token}`, {
      params: { merchantId }
    });
  }

  async getTokensByCustomer(customerId: string, merchantId: string): Promise<TokenResponse[]> {
    const response = await this.client.get(`/token-vault/customers/${customerId}/tokens`, {
      params: { merchantId }
    });
    return response.data;
  }

  async getTokensByMerchant(merchantId: string): Promise<TokenResponse[]> {
    const response = await this.client.get(`/token-vault/merchants/${merchantId}/tokens`);
    return response.data;
  }

  async lookupBin(bin: string): Promise<BinLookupResponse> {
    const response = await this.client.get(`/bin-lookup/${bin}`);
    return response.data;
  }

  async searchBins(query: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get('/bin-lookup/search', {
      params: { q: query }
    });
    return response.data;
  }

  async getBinsByNetwork(network: CardNetwork): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/network/${network}`);
    return response.data;
  }

  async getBinsByCountry(countryCode: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/country/${countryCode}`);
    return response.data;
  }

  async getBinsByCardType(cardType: string): Promise<BinLookupResponse[]> {
    const response = await this.client.get(`/bin-lookup/type/${cardType}`);
    return response.data;
  }
}

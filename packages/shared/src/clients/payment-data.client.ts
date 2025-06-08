import axios, { AxiosInstance } from "axios";

export class PaymentDataClient {
    private readonly httpClient: AxiosInstance;

    constructor(baseUrl: string) {
      this.httpClient = axios.create({
        baseURL: baseUrl
      });
    }

    // Payment
    async listPaymentRequests(): Promise<PaymentRequest[]> {
      const response = await this.httpClient.get('payment-requests');
      return response.data;
    }
  
}
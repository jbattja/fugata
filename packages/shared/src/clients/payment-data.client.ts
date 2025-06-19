import axios, { AxiosInstance } from "axios";
import { PaymentRequest } from "../types/payment/payment-request";

export class PaymentDataClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  // Payment
  async listPaymentRequests(headers: Record<string, string>): Promise<PaymentRequest[]> {
    const response = await this.httpClient.get('payment-requests', { headers: headers });
    return response.data;
  }

}
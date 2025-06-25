import axios, { AxiosInstance } from "axios";
import { PaymentRequest } from "../types/payment/payment-request";
import { PaymentSession } from "../types/payment/payment-session";

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

  async getPaymentSession(headers: Record<string, string>, id: string): Promise<PaymentSession> {
    const response = await this.httpClient.get(`payment-sessions/${id}`, { headers: headers });
    return response.data;
  }

}
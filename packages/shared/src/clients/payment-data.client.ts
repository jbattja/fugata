import axios, { AxiosInstance } from "axios";
import { PaymentSession } from "../types/payment/payment-session";

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

  // Payment Session
  async getPaymentSession(sessionId: string): Promise<PaymentSession> {
    const response = await this.httpClient.get(`payment-sessions/${sessionId}`);
    return response.data;
  }

}
import axios, { AxiosInstance } from "axios";
import { PaymentSession } from "../types/payment/payment-session";
import { Payment } from "../types/payment/payment";

export class PaymentDataClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  // Payments
  async listPayments(headers: Record<string, string>): Promise<{ data: Payment[] }> {
    const response = await this.httpClient.get('payments', { headers: headers });
    return response.data;
  }

  async getPayment(headers: Record<string, string>, id: string): Promise<Payment> {
    const response = await this.httpClient.get(`payments/${id}`, { headers: headers });
    return response.data;
  }

  // Payment Sessions
  async listPaymentSessions(headers: Record<string, string>): Promise<{ data: PaymentSession[] }> {
    const response = await this.httpClient.get('payment-sessions', { headers: headers });
    return response.data;
  }

  async getPaymentSession(headers: Record<string, string>, id: string): Promise<PaymentSession> {
    const response = await this.httpClient.get(`payment-sessions/${id}`, { headers: headers });
    return response.data;
  }

}
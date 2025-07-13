import axios, { AxiosInstance } from "axios";
import { Payment } from "../types/payment/payment";

export class PartnerCommunicatorClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  async authorizePayment(headers: Record<string, string>, partnerName: string, 
    payment: Payment, partnerConfig?: Record<string, any>): Promise<Payment> {
    const response = await this.httpClient.post('partner-communication/authorize-payment', 
      { partnerName, payment, partnerConfig }, { headers: headers }
    );
    return response.data;
  }
} 
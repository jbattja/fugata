import axios, { AxiosInstance } from "axios";
import { Payment } from "../types/payment/payment";
import { Capture } from "../types/payment/capture";

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

  async capturePayment(headers: Record<string, string>, partnerName: string, capture: Capture,
    payment: Payment, partnerConfig?: Record<string, any>): Promise<Capture> {
    const response = await this.httpClient.post('partner-communication/capture-payment', 
      { partnerName, capture, payment, partnerConfig }, { headers: headers }
    );
    return response.data;
  }
} 
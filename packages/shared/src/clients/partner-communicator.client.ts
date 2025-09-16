import axios, { AxiosInstance } from "axios";
import { Payment } from "../types/payment/payment";
import { Capture, Refund, Void } from "../types/payment/operation";

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

  async refundPayment(headers: Record<string, string>, partnerName: string, refund: Refund,
    payment: Payment, partnerConfig?: Record<string, any>): Promise<Refund> {
    const response = await this.httpClient.post('partner-communication/refund-payment', 
      { partnerName, refund, payment, partnerConfig }, { headers: headers }
    );
    return response.data;
  }

  async voidPayment(headers: Record<string, string>, partnerName: string, voidOperation: Void,
    payment: Payment, partnerConfig?: Record<string, any>): Promise<Capture> {
    const response = await this.httpClient.post('partner-communication/void-payment', 
      { partnerName, voidOperation, payment, partnerConfig }, { headers: headers }
    );
    return response.data;
  }
} 
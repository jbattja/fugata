import { HttpService } from "@nestjs/axios";
import { AdyenPaymentRequest, AdyenPaymentResponse } from "./types/adyen-payment";
import { firstValueFrom } from "rxjs";
import { Logger } from "@nestjs/common";

export class AdyenConnector {
    private static readonly logger = new Logger(AdyenConnector.name);
    private static readonly baseUrl = 'https://checkout-test.adyen.com/v71';

    static async createPayment(request: AdyenPaymentRequest, apiKey: string): Promise<AdyenPaymentResponse> {
        const httpService = new HttpService();
        try {
            const response = await firstValueFrom(httpService.post(`${this.baseUrl}/payments`, request, {
                headers: {
                    'x-API-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }));
            return response.data as AdyenPaymentResponse;
        } catch (error) {
            this.logger.error(`Adyen API error: ${error.response?.data?.message || error.message}`);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to process payment with Adyen',
                details: error.response?.data
            };
        }
    }
}
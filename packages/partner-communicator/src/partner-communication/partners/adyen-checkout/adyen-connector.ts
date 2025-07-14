import { AdyenPaymentRequest, AdyenPaymentResponse } from "./types/adyen-payment";
import axios from "axios";
import { SharedLogger } from '@fugata/shared';

export class AdyenConnector {
    private static readonly baseUrl = 'https://checkout-test.adyen.com/v71';

    static async createPayment(request: AdyenPaymentRequest, apiKey: string): Promise<AdyenPaymentResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/payments`, request, {
                headers: {
                    'x-API-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data as AdyenPaymentResponse;
        } catch (error) {
            SharedLogger.error(`Adyen API error: ${error.response?.data?.message || error.message}`, error, AdyenConnector.name);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to process payment with Adyen',
                details: error.response?.data
            };
        }
    }
} 
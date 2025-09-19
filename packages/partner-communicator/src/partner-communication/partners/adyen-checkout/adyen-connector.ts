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

    static async capturePayment(paymentPspReference: string, request: any, apiKey: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/payments/${paymentPspReference}/captures`, request, {
                headers: {
                    'x-API-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            SharedLogger.error(`Adyen capture API error: ${error.response?.data?.message || error.message}`, error, AdyenConnector.name);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to capture payment with Adyen',
                details: error.response?.data
            };
        }
    }

    static async refundPayment(paymentPspReference: string, request: any, apiKey: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/payments/${paymentPspReference}/refunds`, request, {
                headers: {
                    'x-API-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            SharedLogger.error(`Adyen refund API error: ${error.response?.data?.message || error.message}`, error, AdyenConnector.name);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to refund payment with Adyen',
                details: error.response?.data
            };
        }
    }

    static async cancelPayment(paymentPspReference: string, request: any, apiKey: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/payments/${paymentPspReference}/cancels`, request, {
                headers: {
                    'x-API-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            SharedLogger.error(`Adyen cancel API error: ${error.response?.data?.message || error.message}`, error, AdyenConnector.name);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to cancel payment with Adyen',
                details: error.response?.data
            };
        }
    }

    /**
     * Get payment details after redirect from Adyen
     */
    static async getPaymentDetails(request: any, apiKey: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/payments/details`, request, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            SharedLogger.error(`Adyen getPaymentDetails API error: ${error.response?.data?.message || error.message}`, error, AdyenConnector.name);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || 'Failed to get payment details from Adyen',
                details: error.response?.data
            };
        }
    }
} 
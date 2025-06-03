import { HttpService } from "@nestjs/axios";
import { StripePaymentIntent, StripePaymentIntentStatus } from "./types/stripe-payment-intent";
import { firstValueFrom } from "rxjs";
import { getStripePaymentMethod, StripePaymentMethod } from "./types/stripe-payment-method";
import { PaymentRequest } from "@fugata/shared";
import { Logger } from "@nestjs/common";

export class StripeConnector  {
    private static readonly logger = new Logger(StripeConnector.name);
    private static readonly baseUrl = 'https://api.stripe.com';

    static async createPaymentIntent(paymentIntent: StripePaymentIntent, secretKey: string, originalRequest: PaymentRequest): Promise<StripePaymentIntent> {
        const httpService = new HttpService();

        try {
            if (originalRequest.paymentMethod) {
                const paymentMethod = getStripePaymentMethod(originalRequest.paymentMethod);
                const paymentMethodData = await this.createPaymentMethod(paymentMethod, secretKey);
                paymentIntent.payment_method = paymentMethodData.id;
            }

            const response = await firstValueFrom(httpService.post(`${this.baseUrl}/v1/payment_intents`, paymentIntent, {
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/application/x-www-form-urlencoded'
                }
            }));
            if (response.data.status == StripePaymentIntentStatus.REQUIRES_CONFIRMATION) {
                response.data.return_url = originalRequest.returnUrl;
                return this.confirmPaymentIntent(response.data as StripePaymentIntent, secretKey);
            }
            return response.data as StripePaymentIntent;
        } catch (error) {
            this.logger.error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.error?.message || 'Failed to process payment with Stripe',
                details: error.response?.data?.error
            };
        }
    }

    static async createPaymentMethod(paymentMethod: string, secretKey: string): Promise<StripePaymentMethod> {
        const paymentMethodData = {"type": paymentMethod} as StripePaymentMethod;
        const httpService = new HttpService();

        try {
            const response = await firstValueFrom(httpService.post(`${this.baseUrl}/v1/payment_methods`, paymentMethodData, {
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/application/x-www-form-urlencoded'
                }
            }));
            return response.data as StripePaymentMethod;
        } catch (error) {
            this.logger.error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.error?.message || 'Failed to create payment method with Stripe',
                details: error.response?.data?.error
            };
        }
    }

    static async confirmPaymentIntent(paymentIntent: StripePaymentIntent, secretKey: string): Promise<StripePaymentIntent> {
        const confirmPaymentObject = {
            payment_method: paymentIntent.payment_method,
            return_url: paymentIntent.return_url
        }
        const httpService = new HttpService();
        try {
            const response = await firstValueFrom(httpService.post(`${this.baseUrl}/v1/payment_intents/${paymentIntent.id}/confirm`, confirmPaymentObject, {
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/application/x-www-form-urlencoded'
                }
            }));
            return response.data as StripePaymentIntent;
        } catch (error) {
            this.logger.error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
            throw {
                statusCode: error.response?.status || 500,
                message: error.response?.data?.error?.message || 'Failed to confirm payment with Stripe',
                details: error.response?.data?.error
            };
        }
    }
}


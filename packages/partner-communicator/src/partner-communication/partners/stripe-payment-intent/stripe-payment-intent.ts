import { Payment } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { StripePaymentIntentAuthorize } from "./stripe-payment-intent-authorize";
import { SharedLogger } from '@fugata/shared';
import { PartnerIntegrationClass } from "@fugata/shared";

export class StripePaymentIntent extends BasePartner {
    readonly partnerName = PartnerIntegrationClass.STRIPE_PAYMENT_INTENT;
    readonly version = '1.0.0';

    async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
        try {
            return StripePaymentIntentAuthorize.authorize(request);
        } catch (error) {
            return this.createConnectionFailedPayment(request.payment, error.message || 'Stripe payment intent authorization failed');
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            // TODO: Implement actual health check for Stripe
            SharedLogger.log('Stripe payment intent health check', undefined, StripePaymentIntent.name);
            return true;
        } catch (error) {
            return false;
        }
    }
} 
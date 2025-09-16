import { Capture, Payment, Refund, Void } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { StripePaymentIntentAuthorize } from "./stripe-payment-intent-authorize";
import { SharedLogger } from '@fugata/shared';
import { PartnerIntegrationClass } from "@fugata/shared";
import { CapturePaymentRequestDto } from "src/partner-communication/dto/capture-payment-request.dto";
import { UnsupportedOperationError } from "src/partner-communication/exceptions/unsupported-operation-error.filter";
import { VoidPaymentRequestDto } from "src/partner-communication/dto/void-payment-request.dto";
import { RefundPaymentRequestDto } from "src/partner-communication/dto/refund-payment-request.dto";

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

    async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
        throw new UnsupportedOperationError('Stripe payment intent capture not implemented');
    }
    async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
        throw new UnsupportedOperationError('Adyen checkout refund not implemented');
    }

    async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
        throw new UnsupportedOperationError('Adyen checkout void not implemented');
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
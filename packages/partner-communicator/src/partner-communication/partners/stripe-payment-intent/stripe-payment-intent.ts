import { Capture, Payment, Refund, Void } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { AuthenticatePaymentRequestDto } from "../../dto/authenticate-payment-request.dto";
import { ConfirmPaymentRequestDto } from "../../dto/confirm-payment-request.dto";
import { StripePaymentIntentAuthorize } from "./stripe-payment-intent-authorize";
import { StripePaymentIntentCapture } from "./stripe-payment-intent-capture";
import { StripePaymentIntentRefund } from "./stripe-payment-intent-refund";
import { StripePaymentIntentCancel } from "./stripe-payment-intent-cancel";
import { SharedLogger } from '@fugata/shared';
import { PartnerIntegrationClass } from "@fugata/shared";
import { CapturePaymentRequestDto } from "src/partner-communication/dto/capture-payment-request.dto";
import { VoidPaymentRequestDto } from "src/partner-communication/dto/void-payment-request.dto";
import { RefundPaymentRequestDto } from "src/partner-communication/dto/refund-payment-request.dto";
import { UnsupportedOperationError } from "src/partner-communication/exceptions/unsupported-operation-error.filter";

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

    async authenticatePayment(_request: AuthenticatePaymentRequestDto): Promise<Payment> {
        throw new UnsupportedOperationError('Stripe payment intent authentication not implemented');
    }

    async confirmPayment(_request: ConfirmPaymentRequestDto): Promise<Payment> {
        throw new UnsupportedOperationError('Stripe payment intent confirmation not implemented');
    }

    async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
        try {
            return await StripePaymentIntentCapture.capture(request);
        } catch (error) {
            return this.createConnectionFailedCapture(request.capture, error.message || 'Stripe payment intent capture failed');
        }
    }

    async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
        try {
            return await StripePaymentIntentRefund.refund(request);
        } catch (error) {
            return this.createConnectionFailedRefund(request.refund, error.message || 'Stripe payment intent refund failed');
        }
    }

    async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
        try {
            return await StripePaymentIntentCancel.cancel(request);
        } catch (error) {
            return this.createConnectionFailedVoid(request.voidOperation, error.message || 'Stripe payment intent void failed');
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
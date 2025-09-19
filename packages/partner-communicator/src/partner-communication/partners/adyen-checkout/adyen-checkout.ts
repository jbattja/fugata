import { Capture, PartnerIntegrationClass, Payment, Refund, Void } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { AuthenticatePaymentRequestDto } from "../../dto/authenticate-payment-request.dto";
import { ConfirmPaymentRequestDto } from "../../dto/confirm-payment-request.dto";
import { AdyenCheckoutAuthorize } from "./adyen-checkout-authorize";
import { AdyenCheckoutCapture } from "./adyen-checkout-capture";
import { AdyenCheckoutRefund } from "./adyen-checkout-refund";
import { AdyenCheckoutCancel } from "./adyen-checkout-cancel";
import { Logger } from "@nestjs/common";
import { CapturePaymentRequestDto } from "src/partner-communication/dto/capture-payment-request.dto";
import { RefundPaymentRequestDto } from "src/partner-communication/dto/refund-payment-request.dto";
import { VoidPaymentRequestDto } from "src/partner-communication/dto/void-payment-request.dto";

export class AdyenCheckout extends BasePartner {
    readonly partnerName = PartnerIntegrationClass.ADYEN_CHECKOUT;
    readonly version = '1.0.0';

    async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
        try {
            return AdyenCheckoutAuthorize.authorize(request, false);
        } catch (error) {
            return this.createConnectionFailedPayment(request.payment, error.message || 'Adyen checkout authorization failed');
        }
    }

    async authenticatePayment(request: AuthenticatePaymentRequestDto): Promise<Payment> {
        try {
            return AdyenCheckoutAuthorize.authorize(request, true);
        } catch (error) {
            return this.createConnectionFailedPayment(request.payment, error.message || 'Adyen checkout authentication failed');
        }
    }

    async confirmPayment(request: ConfirmPaymentRequestDto): Promise<Payment> {
        try {
            return AdyenCheckoutAuthorize.confirm(request);
        } catch (error) {
            return this.createConnectionFailedPayment(request.payment, error.message || 'Adyen checkout confirmation failed');
        }
    }

    async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
        try {
            return await AdyenCheckoutCapture.capture(request);
        } catch (error) {
            return this.createConnectionFailedCapture(request.capture, error.message || 'Adyen checkout capture failed');
        }
    }

    async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
        try {
            return await AdyenCheckoutRefund.refund(request);
        } catch (error) {
            return this.createConnectionFailedRefund(request.refund, error.message || 'Adyen checkout refund failed');
        }
    }

    async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
        try {
            return await AdyenCheckoutCancel.cancel(request);
        } catch (error) {
            return this.createConnectionFailedVoid(request.voidOperation, error.message || 'Adyen checkout void failed');
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            // TODO: Implement actual health check for Adyen
            Logger.log('Adyen checkout health check', AdyenCheckout.name);
            return true;
        } catch (error) {
            return false;
        }
    }
}
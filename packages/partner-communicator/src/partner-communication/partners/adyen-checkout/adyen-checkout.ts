import { Capture, PartnerIntegrationClass, Payment, Refund, Void } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { AdyenCheckoutAuthorize } from "./adyen-checkout-authorize";
import { Logger } from "@nestjs/common";
import { CapturePaymentRequestDto } from "src/partner-communication/dto/capture-payment-request.dto";
import { UnsupportedOperationError } from "src/partner-communication/exceptions/unsupported-operation-error.filter";
import { RefundPaymentRequestDto } from "src/partner-communication/dto/refund-payment-request.dto";
import { VoidPaymentRequestDto } from "src/partner-communication/dto/void-payment-request.dto";

export class AdyenCheckout extends BasePartner {
    readonly partnerName = PartnerIntegrationClass.ADYEN_CHECKOUT;
    readonly version = '1.0.0';

    async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
        try {
            return AdyenCheckoutAuthorize.authorize(request);
        } catch (error) {
            return this.createConnectionFailedPayment(request.payment, error.message || 'Adyen checkout authorization failed');
        }
    }

    async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
        throw new UnsupportedOperationError('Adyen checkout capture not implemented');
    }

    async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
        throw new UnsupportedOperationError('Adyen checkout refund not implemented');
    }

    async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
        throw new UnsupportedOperationError('Adyen checkout void not implemented');
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
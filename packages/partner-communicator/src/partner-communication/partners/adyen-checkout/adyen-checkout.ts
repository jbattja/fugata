import { PartnerIntegrationClass, Payment } from "@fugata/shared";
import { BasePartner } from "../../base/base-partner";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { AdyenCheckoutAuthorize } from "./adyen-checkout-authorize";
import { Logger } from "@nestjs/common";

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

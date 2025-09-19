import { Refund, OperationStatus } from "@fugata/shared";
import { RefundPaymentRequestDto } from "../../dto/refund-payment-request.dto";
import { AdyenConnector } from "./adyen-connector";
import { SharedLogger } from "@fugata/shared";

export class AdyenCheckoutRefund {

    static async refund(request: RefundPaymentRequestDto): Promise<Refund> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const apiKey = partnerConfig.apiKey;

            if (!apiKey) {
                throw new Error('Adyen configuration missing: apiKey is required');
            }

            // Get the payment PSP reference from the original payment
            const paymentPspReference = request.payment.partnerReference;
            if (!paymentPspReference) {
                throw new Error('Payment PSP reference not found. Payment must be authorized first.');
            }

            // Prepare refund request
            const refundRequest = {
                amount: {
                    value: request.refund.amount?.value || request.payment.amount?.value,
                    currency: request.refund.amount?.currency || request.payment.amount?.currency
                },
                merchantAccount: partnerConfig.merchantAccount,
                reference: request.refund.reference || null
            };

            // Call Adyen refund API
            const adyenResponse = await AdyenConnector.refundPayment(paymentPspReference, refundRequest, apiKey);
            
            // Adyen always returns Received for refunds
            request.refund.status = OperationStatus.SUCCEEDED
            request.refund.partnerReference = adyenResponse.pspReference;

            return request.refund;

        } catch (error) {
            SharedLogger.error(`Adyen refund failed: ${error.message}`, AdyenCheckoutRefund.name);
            request.refund.status = OperationStatus.FAILED;
            request.refund.refusalReason = error.message;
            return request.refund;
        }
    }
}

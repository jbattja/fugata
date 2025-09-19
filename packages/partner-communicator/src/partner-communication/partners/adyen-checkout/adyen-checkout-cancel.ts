import { Void, OperationStatus } from "@fugata/shared";
import { VoidPaymentRequestDto } from "../../dto/void-payment-request.dto";
import { AdyenConnector } from "./adyen-connector";
import { SharedLogger } from "@fugata/shared";

export class AdyenCheckoutCancel {

    static async cancel(request: VoidPaymentRequestDto): Promise<Void> {
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

            // Prepare cancel request
            const cancelRequest = {
                merchantAccount: partnerConfig.merchantAccount,
                reference: request.voidOperation.reference || null
            };

            // Call Adyen cancel API
            const adyenResponse = await AdyenConnector.cancelPayment(paymentPspReference, cancelRequest, apiKey);
            
            // Adyen always returns Received for cancels
            request.voidOperation.status = OperationStatus.SUCCEEDED;
            request.voidOperation.partnerReference = adyenResponse.pspReference;

            return request.voidOperation;

        } catch (error) {
            SharedLogger.error(`Adyen cancel failed: ${error.message}`, AdyenCheckoutCancel.name);
            request.voidOperation.status = OperationStatus.FAILED;
            request.voidOperation.refusalReason = error.message;
            return request.voidOperation;
        }
    }

}

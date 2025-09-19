import { Capture, OperationStatus } from "@fugata/shared";
import { CapturePaymentRequestDto } from "../../dto/capture-payment-request.dto";
import { AdyenConnector } from "./adyen-connector";
import { SharedLogger } from "@fugata/shared";

export class AdyenCheckoutCapture {

    static async capture(request: CapturePaymentRequestDto): Promise<Capture> {
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

            // Prepare capture request
            const captureRequest = {
                amount: {
                    value: request.capture.amount?.value || request.payment.amount?.value,
                    currency: request.capture.amount?.currency || request.payment.amount?.currency
                },
                merchantAccount: partnerConfig.merchantAccount,
                reference: request.capture.reference || null
            };

            // Call Adyen capture API
            const adyenResponse = await AdyenConnector.capturePayment(paymentPspReference, captureRequest, apiKey);
            
            // Adyen always returns Received for captures
            request.capture.status = OperationStatus.SUCCEEDED
            request.capture.partnerReference = adyenResponse.pspReference;
            
            return request.capture;

        } catch (error) {
            SharedLogger.error(`Adyen capture failed: ${error.message}`, AdyenCheckoutCapture.name);
            request.capture.status = OperationStatus.FAILED;
            request.capture.refusalReason = error.message;
            return request.capture;
        }
    }
}

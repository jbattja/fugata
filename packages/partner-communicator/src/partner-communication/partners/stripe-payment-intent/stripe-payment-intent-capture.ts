import { Capture, OperationStatus } from "@fugata/shared";
import { CapturePaymentRequestDto } from "../../dto/capture-payment-request.dto";
import { StripeConnector } from "./stripe-connector";
import { SharedLogger } from "@fugata/shared";

export class StripePaymentIntentCapture {

    static async capture(request: CapturePaymentRequestDto): Promise<Capture> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const secretKey = partnerConfig.secretKey;

            if (!secretKey) {
                throw new Error('Stripe configuration missing: secretKey is required');
            }

            // Get the payment intent ID from the original payment
            const paymentIntentId = request.payment.partnerReference;
            if (!paymentIntentId) {
                throw new Error('Payment intent ID not found. Payment must be authorized first.');
            }

            // Prepare capture request
            const captureRequest = {
                amount_to_capture: request.capture.amount?.value || request.payment.amount?.value
            };

            // Call Stripe capture API
            const stripeResponse = await StripeConnector.capturePaymentIntent(paymentIntentId, captureRequest, secretKey);
            
            // Stripe capture always succeeds if no error is thrown
            request.capture.status = OperationStatus.SUCCEEDED;
            request.capture.partnerReference = stripeResponse.id;

            return request.capture;

        } catch (error) {
            SharedLogger.error(`Stripe capture failed: ${error.message}`, StripePaymentIntentCapture.name);
            request.capture.status = OperationStatus.FAILED;
            request.capture.refusalReason = error.message;
            return request.capture;
        }
    }
}

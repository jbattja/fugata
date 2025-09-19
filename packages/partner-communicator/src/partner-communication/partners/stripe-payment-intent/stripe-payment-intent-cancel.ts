import { Void, OperationStatus } from "@fugata/shared";
import { VoidPaymentRequestDto } from "../../dto/void-payment-request.dto";
import { StripeConnector } from "./stripe-connector";
import { SharedLogger } from "@fugata/shared";

export class StripePaymentIntentCancel {

    static async cancel(request: VoidPaymentRequestDto): Promise<Void> {
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

            // Call Stripe cancel API
            const stripeResponse = await StripeConnector.cancelPaymentIntent(paymentIntentId, secretKey);
            
            // Stripe cancel always succeeds if no error is thrown
            request.voidOperation.status = OperationStatus.SUCCEEDED;
            request.voidOperation.partnerReference = stripeResponse.id;

            return request.voidOperation;

        } catch (error) {
            SharedLogger.error(`Stripe cancel failed: ${error.message}`, StripePaymentIntentCancel.name);
            request.voidOperation.status = OperationStatus.FAILED;
            request.voidOperation.refusalReason = error.message;
            return request.voidOperation;
        }
    }
}

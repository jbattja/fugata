import { Refund, OperationStatus } from "@fugata/shared";
import { RefundPaymentRequestDto } from "../../dto/refund-payment-request.dto";
import { StripeConnector } from "./stripe-connector";
import { SharedLogger } from "@fugata/shared";

export class StripePaymentIntentRefund {

    static async refund(request: RefundPaymentRequestDto): Promise<Refund> {
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

            // Prepare refund request
            const refundRequest = {
                payment_intent: paymentIntentId,
                amount: request.refund.amount?.value || request.payment.amount?.value,
                reason: 'requested_by_customer'
            };

            // Call Stripe refund API
            const stripeResponse = await StripeConnector.createRefund(refundRequest, secretKey);
            
            // Stripe refund always succeeds if no error is thrown
            request.refund.status = OperationStatus.SUCCEEDED;
            request.refund.partnerReference = stripeResponse.id;

            return request.refund;

        } catch (error) {
            SharedLogger.error(`Stripe refund failed: ${error.message}`, StripePaymentIntentRefund.name);
            request.refund.status = OperationStatus.FAILED;
            request.refund.refusalReason = error.message;
            return request.refund;
        }
    }
}

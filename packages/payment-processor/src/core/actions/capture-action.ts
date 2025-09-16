import { Capture, FugataReference, OperationStatus, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "..";

export class CaptureAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.captureAttempts++;
        this.log(`Executing Capture action attempt number ${context.captureAttempts}`);

        if (!context.capture) {
            context.capture = new Capture({
                operationId: FugataReference.generateReference(),
                paymentId: context.payment.paymentId,
                amount: context.payment.amount,
                status: OperationStatus.INITIATED,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        this.handleInvalidPaymentStatus(context);
        if (context.capture.status === OperationStatus.FAILED) {
            return context;
        }
        if (this.getAmountCapturable(context) < context.capture.amount.value) {
            this.log('Capture amount is too high');
            context.capture.status = OperationStatus.FAILED;
            context.capture.refusalReason = "Capture amount too high";
            return context;
        }

        try {
            // Call partner communicator for capture
            context.capture = await this.captureWithPartner(context);
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }

        if (context.capture.status === OperationStatus.SUCCEEDED) {
            if ((this.getTotalAmountCaptured(context) + context.capture.amount.value) >= context.payment.amount.value) {
                context.payment.status = PaymentStatus.CAPTURED;
            } else {
                context.payment.status = PaymentStatus.PARTIALLY_CAPTURED;
            }
        }

        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentCaptured(context.payment, context.capture);
        }
        return context;
    }

    private async captureWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);

        SharedLogger.log('Capture payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, CaptureAction.name);

        return await ActionRegistry.getPartnerCommunicatorClient().capturePayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.capture,
            context.payment,
            partnerConfig
        );
    }


    private handlePartnerError(context: PaymentContext) {
        context.capture.status = OperationStatus.FAILED;
        context.capture.refusalReason = "Partner communication failed";
    }

    private handleInvalidPaymentStatus(context: PaymentContext) {
        switch (context.payment.status) {
            case PaymentStatus.AUTHORIZED:
                break;
            case PaymentStatus.PARTIALLY_CAPTURED:
                break;
            case PaymentStatus.CAPTURED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Payment already captured";
                break;
            case PaymentStatus.VOIDED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Payment voided";
                break;
            case PaymentStatus.REFUSED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Payment refused";
                break;
            case PaymentStatus.REFUNDED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Cannot capture a refunded payment";
                break;
            case PaymentStatus.REVERSED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Cannot capture a reversed payment";
                break;
            case PaymentStatus.INITIATED:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Payment not yet authorized";
                break;
            case PaymentStatus.AUTHORIZATION_PENDING:
                context.capture.status = OperationStatus.FAILED;
                context.capture.refusalReason = "Payment not yet authorized";
                break;
            default:
                break;
        }
    }

} 
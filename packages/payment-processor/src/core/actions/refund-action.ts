import { Refund, FugataReference, OperationStatus, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "..";

export class RefundAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.refundAttempts++;
        this.log(`Executing Refund action attempt number ${context.refundAttempts}`);

        if (!context.refund) {
            context.refund = new Refund({
                operationId: FugataReference.generateReference(),
                paymentId: context.payment.paymentId,
                amount: context.payment.amount,
                status: OperationStatus.INITIATED,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        this.handleInvalidPaymentStatus(context);
        if (context.refund.status === OperationStatus.FAILED) {
            return context;
        }
        if (this.getAmountRefundable(context) == 0) {
            this.log('Fully Refunded');
            context.refund.status = OperationStatus.FAILED;
            context.refund.refusalReason = "Payment already fully refunded";
            return context;
        }
        if (this.getAmountRefundable(context) < context.refund.amount.value) {
            this.log('Refund amount is too high');
            context.refund.status = OperationStatus.FAILED;
            context.refund.refusalReason = "Refund amount is too high";
            return context;
        }

        try {
            // Call partner communicator for refund
            context.refund = await this.refundWithPartner(context);
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }

        if (context.refund.status === OperationStatus.SUCCEEDED) {
            context.payment.status = PaymentStatus.REFUNDED;
        }

        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentRefunded(context.payment, context.refund);
        }

        this.log('Refund action completed', context.refund);
        return context;
    }

    private async refundWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);

        SharedLogger.log('Refund payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, RefundAction.name);

        return await ActionRegistry.getPartnerCommunicatorClient().refundPayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.refund,
            context.payment,
            partnerConfig
        );
    }


    private handlePartnerError(context: PaymentContext) {
        context.refund.status = OperationStatus.FAILED;
        context.refund.refusalReason = "Partner communication failed";
    }

    private handleInvalidPaymentStatus(context: PaymentContext) {
        switch (context.payment.status) {
            case PaymentStatus.CAPTURED:
                break;
            case PaymentStatus.PARTIALLY_CAPTURED:
                break;
            case PaymentStatus.REFUNDED:
                break;
            case PaymentStatus.AUTHORIZED:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Payment not captured yet";
                break;
            case PaymentStatus.VOIDED:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Payment voided";
                break;
            case PaymentStatus.REFUSED:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Payment refused";
                break;
            case PaymentStatus.REVERSED:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Cannot refund a reversed payment";
                break;
            case PaymentStatus.INITIATED:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Payment not yet authorized";
                break;
            case PaymentStatus.AUTHORIZATION_PENDING:
                context.refund.status = OperationStatus.FAILED;
                context.refund.refusalReason = "Payment not yet authorized";
                break;
            default:
                break;
        }
    }
} 
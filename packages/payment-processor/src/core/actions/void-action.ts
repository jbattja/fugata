import { Void, FugataReference, OperationStatus, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "..";

export class VoidAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.voidAttempts++;
        this.log(`Executing Void action attempt number ${context.voidAttempts}`);

        if (!context.void) {
            context.void = new Void({
                operationId: FugataReference.generateReference(),
                paymentId: context.payment.paymentId,
                status: OperationStatus.INITIATED,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        this.handleInvalidPaymentStatus(context);
        if (context.void.status === OperationStatus.FAILED) {
            return context;
        }

        try {
            // Call partner communicator for void
            context.void = await this.voidWithPartner(context);
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }

        if (context.void.status === OperationStatus.SUCCEEDED) {
            context.payment.status = context.payment.status == PaymentStatus.PARTIALLY_CAPTURED ? PaymentStatus.CAPTURED : PaymentStatus.VOIDED;
        }

        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentVoided(context.payment, context.void);
        }
        return context;
    }

    private async voidWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);

        SharedLogger.log('Void payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, VoidAction.name);

        return await ActionRegistry.getPartnerCommunicatorClient().voidPayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.void,
            context.payment,
            partnerConfig
        );
    }


    private handlePartnerError(context: PaymentContext) {
        context.void.status = OperationStatus.ERROR;
        context.void.refusalReason = "Partner communication failed";
    }

    private handleInvalidPaymentStatus(context: PaymentContext) {
        switch (context.payment.status) {
            case PaymentStatus.AUTHORIZED:
                break;
            case PaymentStatus.PARTIALLY_CAPTURED:
                break;
            case PaymentStatus.CAPTURED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Payment already captured";
                break;
            case PaymentStatus.VOIDED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Payment already voided";
                break;
            case PaymentStatus.REFUSED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Payment refused";
                break;
            case PaymentStatus.REFUNDED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Cannot void a refunded payment";
                break;
            case PaymentStatus.REVERSED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Cannot void a reversed payment";
                break;
            case PaymentStatus.INITIATED:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Payment not yet authorized";
                break;
            case PaymentStatus.AUTHORIZATION_PENDING:
                context.void.status = OperationStatus.FAILED;
                context.void.refusalReason = "Payment not yet authorized";
                break;
            default:
                break;
        }
    }
} 
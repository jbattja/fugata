import { Capture, CaptureStatus, FugataReference, PaymentStatus, ProviderCredential, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { v4 as uuidv4 } from 'uuid';
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "..";

export class CaptureAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.captureAttempts++;
        this.log(`Executing Capture action attempt number ${context.captureAttempts}`);

        if (!context.capture) {
            context.capture = new Capture({
                captureId: FugataReference.generateReference(),
                paymentId: context.payment.paymentId,
                amount: context.payment.amount,
                status: CaptureStatus.INITIATED,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        this.handleInvalidPaymentStatus(context);
        if (context.capture.status === CaptureStatus.FAILED) {
            return context;
        }
        if (context.payment.amount.value < context.capture.amount.value) {
            this.log('Capture amount is greater than payment amount');
            this.handleInvalidCaptureAmount(context);
            return context;
        }

        try {
            // Call partner communicator for capture
            context.capture = await this.captureWithPartner(context);
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }

        // TODO implement multipl partial captures
        if (context.capture.status === CaptureStatus.SUCCEEDED) {
            context.payment.status = PaymentStatus.CAPTURED;
        }

        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentCaptured(context.payment);
        }
        //Math.random() > 0.1 ? this.mockCaptureSuccess(context) : this.mockCaptureFailed(context);
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

    private async getPartnerConfig(context: PaymentContext) {
        let providerCredential = context.providerCredential;
        if (!this.isProviderCredentialValid(providerCredential)) {
            if (providerCredential && providerCredential.id) {
                providerCredential = await ActionRegistry.getSettingsClient().getProviderCredential(
                    extractAuthHeaders(context.request), providerCredential.id);
            } else {
                providerCredential = await ActionRegistry.getSettingsClient().getProviderCredentialForMerchant(
                    extractAuthHeaders(context.request), context.merchant.id, context.payment.paymentInstrument.paymentMethod);
            }
        }
        if (!providerCredential) {
            throw new Error(`No provider credential found for merchant ${context.merchant.id} with payment method ${context.payment.paymentInstrument.paymentMethod}`);
        }
        context.providerCredential = providerCredential;
        return { ...providerCredential.provider.settings, ...providerCredential.settings };
    }

    private isProviderCredentialValid(providerCredential: Partial<ProviderCredential>) {
        if (!providerCredential) {
            return false;
        }
        if (!providerCredential.id || !providerCredential.accountCode) {
            return false;
        }
        if (!providerCredential.provider || !providerCredential.settings) {
            return false;
        }
        return true;
    }

    private mockCaptureSuccess(context: PaymentContext) {
        context.payment.status = PaymentStatus.CAPTURED;
        context.capture = new Capture({
            captureId: uuidv4(),
            paymentId: context.payment.paymentId,
            amount: context.payment.amount,
            status: CaptureStatus.SUCCEEDED,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    private mockCaptureFailed(context: PaymentContext) {
        context.capture = {
            captureId: uuidv4(),
            paymentId: context.payment.paymentId,
            amount: context.payment.amount,
            status: CaptureStatus.FAILED,
            refusalReason: "Network Error",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private handlePartnerError(context: PaymentContext) {
        context.capture.status = CaptureStatus.FAILED;
        context.capture.refusalReason = "Partner communication failed";
    }

    private handleInvalidPaymentStatus(context: PaymentContext) {
        switch (context.payment.status) {
            case PaymentStatus.AUTHORIZED:
                break;
            case PaymentStatus.PARTIALLY_CAPTURED:
                break;
            case PaymentStatus.CAPTURED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Payment already captured";
                break;
            case PaymentStatus.VOIDED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Payment voided";
                break;
            case PaymentStatus.REFUSED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Payment refused";
                break;
            case PaymentStatus.REFUNDED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Cannot capture a refunded payment";
                break;
            case PaymentStatus.REVERSED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Cannot capture a reversed payment";
                break;
            case PaymentStatus.INITIATED:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Payment not yet authorized";
                break;
            case PaymentStatus.AUTHORIZATION_PENDING:
                context.capture.status = CaptureStatus.FAILED;
                context.capture.refusalReason = "Payment not yet authorized";
                break;
            default:
                break;
        }
    }

    private handleInvalidCaptureAmount(context: PaymentContext) {
        context.capture.status = CaptureStatus.FAILED;
        context.capture.refusalReason = "Capture amount is greater than payment amount";
    }

} 
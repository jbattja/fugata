import { AuthorizationData, PaymentMethod, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "./action-registry";
import { RedirectWrapperService } from "../services/redirect-wrapper.service";

export class AuthorizeAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.authorizeAttempts++;
        this.log(`Executing Authorize action attempt number ${context.authorizeAttempts}`);

        // Payments may already be authorized during the Authenticate or ConfirmPayment action

        if (context.payment.status === PaymentStatus.INITIATED) {
            let authorizationData = context.payment.authorizationData;
            if (!authorizationData) {
                authorizationData = new AuthorizationData();
            }
            context.payment.authorizationData = authorizationData;

            const partnerConfig = await this.getPartnerConfig(context);
            if (partnerConfig) {
                context.payment = await this.authorizeWithPartner(context, partnerConfig);
                this.updateStatustoCapturedIfSeperateCaptureNotSupported(context);
            }
        }

        if (context.payment.status === PaymentStatus.REFUSED && context.authorizeAttempts < context.config.maxAuthorizeAttempts) {
            context.payment.status = PaymentStatus.INITIATED;
            return context;
        }

        // Publish payment authorized event
        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentAuthorized(context.payment);
        }
        return context;
    }

    private async authorizeWithPartner(context: PaymentContext, partnerConfig: Record<string, any>) {
        const headers = extractAuthHeaders(context.request);

        context.payment.providerCredential = { id: context.providerCredential.id, accountCode: context.providerCredential.accountCode };

        const orignalReturnUrl = context.payment.returnUrl;
        context.payment.returnUrl = RedirectWrapperService.createPartnerReturnUrl(context.payment.paymentId, partnerConfig?.partnerIntegrationClass);

        SharedLogger.log('Authorizing payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, AuthorizeAction.name);

        try {
            context.payment = await ActionRegistry.getPartnerCommunicatorClient().authorizePayment(
                headers,
                partnerConfig.partnerIntegrationClass,
                context.payment,
                partnerConfig
            );
            // Wrap any redirect actions to use our checkout redirect page
            if (context.payment.actions && context.payment.actions.length > 0) {
                context.payment.actions = RedirectWrapperService.wrapPaymentRedirects(context.payment.actions, context.payment.paymentId);
            }
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        } finally {
            context.payment.returnUrl = orignalReturnUrl;
        }
        return context.payment;
    }

    private updateStatustoCapturedIfSeperateCaptureNotSupported(context: PaymentContext) {
        const paymentMethod = context.payment?.paymentInstrument?.paymentMethod;
        if (this.isSeperateCaptureSupported(paymentMethod)) {
            return;
        }
        if (context.payment.status == PaymentStatus.AUTHORIZED) {
            context.payment.status = PaymentStatus.CAPTURED;
        }
    }

    private isSeperateCaptureSupported(paymentMethod: PaymentMethod) {
        return paymentMethod === PaymentMethod.CARD;
    }
} 
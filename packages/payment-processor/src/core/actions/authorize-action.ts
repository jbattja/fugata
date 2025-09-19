import { AuthorizationData, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "./action-registry";
import { RedirectWrapperService } from "../services/redirect-wrapper.service";

export class AuthorizeAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.authorizeAttempts++;
        this.log(`Executing Authorize action attempt number ${context.authorizeAttempts}`);

        let authorizationData = context.payment.authorizationData;
        if (!authorizationData) {
            authorizationData = new AuthorizationData();
        }
        context.payment.authorizationData = authorizationData;

        try {
            // Call partner communicator for authorization
            context.payment = await this.authorizeWithPartner(context);
            
            // Wrap any redirect actions to use our checkout redirect page
            if (context.payment.actions && context.payment.actions.length > 0) {
                context.payment.actions = RedirectWrapperService.wrapPaymentRedirects(context.payment.actions, context.payment.paymentId);
            }
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }
        if (context.payment.status === PaymentStatus.REFUSED && context.authorizeAttempts < context.config.maxAuthorizeAttempts) {
            return context;
        }
        // Publish payment authorized event
        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentAuthorized(context.payment);
        }
        return context;
    }

    private async authorizeWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);
        context.payment.providerCredential = {id: context.providerCredential.id, accountCode: context.providerCredential.accountCode};

        const orignalReturnUrl = context.payment.returnUrl;
        context.payment.returnUrl = RedirectWrapperService.createPartnerReturnUrl(context.payment.paymentId, partnerConfig?.partnerIntegrationClass);

        SharedLogger.log('Authorizing payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, AuthorizeAction.name);

        const payment = await ActionRegistry.getPartnerCommunicatorClient().authorizePayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.payment,
            partnerConfig
        );
        context.payment.returnUrl = orignalReturnUrl;
        return payment;
    }

    private handlePartnerError(context: PaymentContext) {
        context.payment.status = PaymentStatus.ERROR;
        context.payment.refusalReason = "Partner communication failed";
    }
} 
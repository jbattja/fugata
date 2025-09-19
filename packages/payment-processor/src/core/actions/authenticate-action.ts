import { AuthenticationData, PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "./action-registry";
import { RedirectWrapperService } from "../services/redirect-wrapper.service";

export class AuthenticateAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Authenticate action');
        
        let authenticationData = context.payment.authenticationData;
        if (!authenticationData) {
            authenticationData = new AuthenticationData();
        }
        context.payment.authenticationData = authenticationData;

        try {
            // Call partner communicator for authentication
            context.payment = await this.authenticateWithPartner(context);

            // Wrap any redirect actions to use our checkout redirect page
            if (context.payment.actions && context.payment.actions.length > 0) {
                context.payment.actions = RedirectWrapperService.wrapPaymentRedirects(context.payment.actions, context.payment.paymentId);
            }
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }

        // Publish payment authenticated event
        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentAuthenticated(context.payment);
            this.log('Published PAYMENT_AUTHENTICATED event');
        }

        return context;
    }

    private async authenticateWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);
        context.payment.providerCredential = {id: context.providerCredential.id, accountCode: context.providerCredential.accountCode};
        const orignalReturnUrl = context.payment.returnUrl;
        context.payment.returnUrl = RedirectWrapperService.createPartnerReturnUrl(context.payment.paymentId, partnerConfig?.partnerIntegrationClass);

        SharedLogger.log('Authenticating payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, AuthenticateAction.name);

        context.payment = await ActionRegistry.getPartnerCommunicatorClient().authenticatePayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.payment,
            partnerConfig
        );
        context.payment.returnUrl = orignalReturnUrl;
        return context.payment;
    }

    private handlePartnerError(context: PaymentContext) {
        context.payment.status = PaymentStatus.ERROR;
        context.payment.refusalReason = "Partner authentication failed";
    }
} 
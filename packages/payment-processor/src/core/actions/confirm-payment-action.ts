import { PaymentStatus, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "./action-registry";

export class ConfirmPaymentAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing ConfirmPayment action');
        
        try {
            // Get partner config to determine which partner to call
            const partnerConfig = await this.getPartnerConfig(context);
            context.payment.providerCredential = {id: context.providerCredential.id, accountCode: context.providerCredential.accountCode};

            if (partnerConfig?.partnerIntegrationClass != context.confirmPayment?.partnerName) {
                throw new Error(`Partner config does not match partner name: ${partnerConfig?.partnerIntegrationClass} != ${context.confirmPayment?.partnerName}`);
            }

            // Call partner communicator to confirm payment with URL parameters
            context.payment = await this.confirmWithPartner(context);
            
            this.log('ConfirmPayment action completed', context.payment.status);
            return context;
        } catch (error) {
            this.error('Partner confirmation failed', error);
            this.handlePartnerError(context);
            return context;
        }
    }

    private async confirmWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);
        context.payment.providerCredential = {id: context.providerCredential.id, accountCode: context.providerCredential.accountCode};

        SharedLogger.log('Confirming payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, ConfirmPaymentAction.name);

        return await ActionRegistry.getPartnerCommunicatorClient().confirmPayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.payment,
            context.confirmPayment.urlParams || {},
            partnerConfig
        );
    }

    private handlePartnerError(context: PaymentContext) {
        context.payment.status = PaymentStatus.ERROR;
        context.payment.refusalReason = "Partner confirmation failed";
    }
}

import { SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";
import { ActionRegistry } from "./action-registry";

export class ConfirmPaymentAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing ConfirmPayment action');

        const partnerConfig = await this.getPartnerConfig(context);
        if (partnerConfig) {
            if (partnerConfig?.partnerIntegrationClass != context.confirmPayment?.partnerName) {
                throw new Error(`Partner config does not match partner name: ${partnerConfig?.partnerIntegrationClass} != ${context.confirmPayment?.partnerName}`);
            }
            context.payment = await this.confirmWithPartner(context, partnerConfig);
        }
        return context;
    }

    private async confirmWithPartner(context: PaymentContext, partnerConfig: Record<string, any>) {
        const headers = extractAuthHeaders(context.request);

        SharedLogger.log('Confirming payment with partner ' + partnerConfig?.partnerIntegrationClass, undefined, ConfirmPaymentAction.name);

        try {
            return await ActionRegistry.getPartnerCommunicatorClient().confirmPayment(
                headers,
                partnerConfig.partnerIntegrationClass,
                context.payment,
                context.confirmPayment.urlParams || {},
                partnerConfig
            );
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }
    }
}

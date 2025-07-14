import { AuthorizationData, PaymentStatus, PartnerCommunicatorClient, SettingsClient, SharedLogger } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { extractAuthHeaders } from "src/clients/jwt.service";

export class AuthorizeAction extends BaseAction {
    constructor(private readonly partnerCommunicatorClient: PartnerCommunicatorClient,
        private readonly settingsClient: SettingsClient) {
        super();
    }

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
        } catch (error) {
            this.error('Partner communication failed', error);
            this.handlePartnerError(context);
        }
        return context;
    }

    private async authorizeWithPartner(context: PaymentContext) {
        const headers = extractAuthHeaders(context.request);

        const partnerConfig = await this.getPartnerConfig(context);

        SharedLogger.log('Authorizing payment with partner', partnerConfig, AuthorizeAction.name);

        return await this.partnerCommunicatorClient.authorizePayment(
            headers,
            partnerConfig.partnerIntegrationClass,
            context.payment,
            partnerConfig
        );
    }

    private async getPartnerConfig(context: PaymentContext) {
        const providerCredential = await this.settingsClient.getProviderCredentialForMerchant(
            extractAuthHeaders(context.request), context.merchant.id, context.payment.paymentInstrument.paymentMethod);
        if (!providerCredential) {
            throw new Error(`No provider credential found for merchant ${context.merchant.id} with payment method ${context.payment.paymentInstrument.paymentMethod}`);
        } 
        return { ...providerCredential.provider.settings, ...providerCredential.settings };
    }

    private handlePartnerError(context: PaymentContext) {
        context.payment.status = PaymentStatus.REFUSED;
        context.payment.refusalReason = "Partner communication failed";
    }
} 
import { Action, ActionType, addActionToPayment, AuthenticationData, AuthenticationFlow, PaymentStatus, RedirectMethod } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { v4 as uuidv4 } from 'uuid';
import { ActionRegistry } from "..";

export class AuthenticateAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Authenticate action');
        // TODO: Call authentication service
        let authenticationData = context.payment.authenticationData;
        if (!authenticationData) {
            authenticationData = new AuthenticationData();
        }
        context.payment.authenticationData = authenticationData;

        if (context.payment.customer?.customerName?.toLowerCase() === 'challenge') {
            this.mockAuthenticationChallenge(context);
        } else {
            this.mockAuthenticationFrictionless(context);
        }

        this.log('Authenticate action completed', context.payment.authenticationData);
        // Publish payment authenticated event
        const paymentProducer = ActionRegistry.getPaymentProducer();
        if (paymentProducer) {
            await paymentProducer.publishPaymentAuthenticated(context.payment);
            this.log('Published PAYMENT_AUTHENTICATED event');
        }
        return context;
    }

    private mockAuthenticationChallenge(context: PaymentContext) { 
        context.payment.authenticationData.authenticationFlow = AuthenticationFlow.CHALLENGE;
        const redirectLinkUrl = process.env.PAYMENT_LINK_URL || 'http://localhost:8081';
        const action = new Action();
        action.actionType = ActionType.REDIRECT;
        action.redirectUrl = `${redirectLinkUrl}/redirect/${context.payment.paymentId}`;
        action.redirectMethod = RedirectMethod.GET;
        addActionToPayment(context.payment, action);
    }

    private mockAuthenticationFrictionless(context: PaymentContext) { 
        context.payment.authenticationData.authenticationFlow = AuthenticationFlow.FRICTIONLESS;
        context.payment.authenticationData.eci = "7";
        context.payment.authenticationData.liabilityShifted = "Y";
        context.payment.authenticationData.version = "2.1.0";
        context.payment.authenticationData.transactionId = uuidv4();
        context.payment.authenticationData.cavv = "1234567890";
        context.payment.status = PaymentStatus.AUTHORIZATION_PENDING;
        }
} 
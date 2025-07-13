import { Payment, PaymentStatus, Amount, ActionType, RedirectMethod, Action } from "@fugata/shared";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { StripeConnector } from "./stripe-connector";
import { StripePaymentIntent, StripePaymentIntentStatus, StripeCaptureMethod, StripeConfirmationMethod, StripePaymentIntentNextAction, StripePaymentIntentNextActionType, StripePaymentIntentBuilder } from "./types/stripe-payment-intent";
import { getStripePaymentMethod } from "./types/stripe-payment-method";
import { Logger } from "@nestjs/common";

export class StripePaymentIntentAuthorize {

    static async authorize(request: AuthorizePaymentRequestDto): Promise<Payment> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const secretKey = partnerConfig.secretKey;

            if (!secretKey) {
                throw new Error('Stripe configuration missing: secretKey is required');
            }

            // Transform payment to Stripe request
            const stripeRequest = this.transformPaymentToStripeRequest(request.payment);
            
            // Call Stripe API
            const stripeResponse = await StripeConnector.createPaymentIntent(stripeRequest, secretKey, request.payment);
            
            // Transform Stripe response back to payment
            return this.transformStripeResponseToPayment(request.payment, stripeResponse);
            
        } catch (error) {
            Logger.error(`Stripe authorization failed: ${error.message}`, StripePaymentIntentAuthorize.name);
            throw error;
        }
    }

    private static transformPaymentToStripeRequest(payment: Payment): StripePaymentIntent {
        const stripeRequest = new StripePaymentIntentBuilder()
            .withAmount(this.mapAmountToStripeAmount(payment.amount))
            .withCurrency(payment.amount.currency.toLowerCase())
            .withCaptureMethod(this.mapCaptureMethodToStripeCaptureMethod(payment.captureMethod))
            .withDescription(payment.description)
            .withMetadata(payment.metadata)
            .withPaymentMethodTypes([getStripePaymentMethod(payment.paymentInstrument?.paymentMethod)])
            .withConfirmationMethod(StripeConfirmationMethod.AUTOMATIC)
            .build();

        // Add customer information if available
        if (payment.customer) {
            stripeRequest.customer = payment.customer.id;
        }
        return stripeRequest;
    }

    private static transformStripeResponseToPayment(originalPayment: Payment, stripeResponse: StripePaymentIntent): Payment {
        const payment = new Payment({
            ...originalPayment,
            authorizationData: {
                acquirerReference: stripeResponse.id,
            },
            status: this.mapStripeStatusToPaymentStatus(stripeResponse.status),
        });

        if (payment.status === PaymentStatus.REFUSED) {
            payment.refusalReason = stripeResponse.last_payment_error?.message || 'Payment failed';
        }

        if (stripeResponse.next_action && stripeResponse.next_action.type === StripePaymentIntentNextActionType.REDIRECT_TO_URL) {
            payment.actions = [
                this.createRedirectAction(stripeResponse.next_action)
            ];
        }

        return payment;
    }

    private static createRedirectAction(stripeNextAction: StripePaymentIntentNextAction): Action {
        return {
            actionType: ActionType.REDIRECT,
            redirectUrl: stripeNextAction.redirect_to_url.url,
            redirectMethod: RedirectMethod.GET
        };
    }

    private static mapAmountToStripeAmount(amount: Amount): number {
        return amount.value;
    }

    private static mapCaptureMethodToStripeCaptureMethod(captureMethod: any): StripeCaptureMethod {
        return captureMethod === 'MANUAL' ? StripeCaptureMethod.MANUAL : StripeCaptureMethod.AUTOMATIC;
    }

    private static mapStripeStatusToPaymentStatus(status: StripePaymentIntentStatus): PaymentStatus {
        switch (status) {
            case StripePaymentIntentStatus.REQUIRES_PAYMENT_METHOD:
                return PaymentStatus.REFUSED;
            case StripePaymentIntentStatus.REQUIRES_CONFIRMATION:
                return PaymentStatus.AUTHORIZED;
            case StripePaymentIntentStatus.REQUIRES_ACTION:
                return PaymentStatus.AUTHORIZED;
            case StripePaymentIntentStatus.PROCESSING:
                return PaymentStatus.AUTHORIZED;
            case StripePaymentIntentStatus.REQUIRES_CAPTURE:
                return PaymentStatus.AUTHORIZED;
            case StripePaymentIntentStatus.CANCELED:
                return PaymentStatus.REFUSED;
            case StripePaymentIntentStatus.SUCCEEDED:
                return PaymentStatus.AUTHORIZED;
            default:
                return PaymentStatus.REFUSED;
        }
    }
} 
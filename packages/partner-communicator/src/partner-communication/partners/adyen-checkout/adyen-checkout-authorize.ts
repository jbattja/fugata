import { Payment, PaymentStatus, Amount, PaymentMethod, ActionType, RedirectMethod, Action, PaymentInstrument, CardDetails } from "@fugata/shared";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { AdyenConnector } from "./adyen-connector";
import { AdyenPaymentRequest, AdyenPaymentResponse, AdyenAmount, AdyenPaymentMethod, AdyenPaymentResultCode, AdyenShopper, AdyenActionMethod, AdyenActionType, AdyenAction, AdyenPaymentRequestBuilder } from "./types/adyen-payment";
import { getAdyenPaymentMethod } from "./types/adyen-payment-method";
import { SharedLogger } from "@fugata/shared";

export class AdyenCheckoutAuthorize {

    static async authorize(request: AuthorizePaymentRequestDto): Promise<Payment> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const apiKey = partnerConfig.apiKey;
            const merchantAccount = partnerConfig.merchantAccount;

            if (!apiKey || !merchantAccount) {
                throw new Error('Adyen configuration missing: apiKey and merchantAccount are required');
            }

            // Transform payment to Adyen request
            const adyenRequest = this.transformPaymentToAdyenRequest(request.payment, merchantAccount);
            
            // Call Adyen API
            const adyenResponse = await AdyenConnector.createPayment(adyenRequest, apiKey);
            
            // Transform Adyen response back to payment
            return this.transformAdyenResponseToPayment(request.payment, adyenResponse);
            
        } catch (error) {
            SharedLogger.error(`Adyen authorization failed: ${error.message}`, AdyenCheckoutAuthorize.name);
            throw error;
        }
    }

    private static transformPaymentToAdyenRequest(payment: Payment, merchantAccount: string): AdyenPaymentRequest {
        const adyenRequest = new AdyenPaymentRequestBuilder()
            .withAmount(this.mapAmountToAdyenAmount(payment.amount))
            .withMerchantAccount(merchantAccount)
            .withReference(payment.reference || `payment_${Date.now()}`)
            .withReturnUrl(payment.returnUrl)
            .withPaymentMethod(this.mapPaymentMethodToAdyenMethod(payment.paymentInstrument))
            .withMetadata(payment.metadata)
            .build();

        // Add customer information if available
        if (payment.customer) {
            adyenRequest.shopperReference = payment.customer.id;
            adyenRequest.shopperEmail = payment.customer.customerEmail;
            adyenRequest.shopperLocale = payment.customer.customerLocale;
            
            if (payment.customer.customerName) {
                const shopperName = payment.customer.customerName.split(' ');
                if (shopperName.length === 2) {
                    adyenRequest.shopperName = new AdyenShopper(shopperName[0], shopperName[1]);
                }
            }
        }
        return adyenRequest;
    }

    private static transformAdyenResponseToPayment(originalPayment: Payment, adyenResponse: AdyenPaymentResponse): Payment {
        const payment = new Payment({
            ...originalPayment,
            authorizationData: {
                acquirerReference: adyenResponse.pspReference,
            },
            partnerReference: adyenResponse.pspReference,
            status: this.mapAdyenResultCodeToPaymentStatus(adyenResponse.resultCode),
        });
        if (payment.status == PaymentStatus.REFUSED) {
            payment.refusalReason = adyenResponse.refusalReason;
        }
        if (adyenResponse.action && adyenResponse.action.type === AdyenActionType.REDIRECT) {
            payment.actions = [
                this.createRedirectAction(adyenResponse.action)
            ];
        }
        return payment;
    }

    private static createRedirectAction(adyenAction: AdyenAction): Action {
        // TODO: Implement redirect action creation using our own URL and not the Adyen one
        return {
            actionType: ActionType.REDIRECT,
            redirectUrl: adyenAction.url,
            redirectMethod: adyenAction.method === AdyenActionMethod.POST ? RedirectMethod.POST : RedirectMethod.GET
        };
    }

    private static createFailedPayment(payment: Payment, errorMessage: string): Payment {
        return new Payment({
            ...payment,
            status: PaymentStatus.REFUSED,
            refusalReason: errorMessage,
            authorizationData: {
                responseMessage: 'Error',
                networkResponseCode: '99',
                acquirerReference: `error_${Date.now()}`,
                avsResult: 'N',
                authCode: '0000000000',
            }
        });
    }

    private static mapAmountToAdyenAmount(amount: Amount): AdyenAmount {
        return new AdyenAmount(amount.value, amount.currency);
    }

    private static mapPaymentMethodToAdyenMethod(paymentInstrument: PaymentInstrument, testMode: boolean = true): AdyenPaymentMethod {
        if (!paymentInstrument) {
            return null;
        }
        if (!paymentInstrument.paymentMethod) {
            return null;
        }
        const adyenMethod = new AdyenPaymentMethod();
        adyenMethod.type = getAdyenPaymentMethod(paymentInstrument.paymentMethod);
        if (paymentInstrument.paymentMethod === PaymentMethod.CARD) {
            const cardDetails = paymentInstrument.instrumentDetails as CardDetails;
            if (!cardDetails) {
                return adyenMethod;
            }
            if (testMode) {
                adyenMethod.encryptedCardNumber = cardDetails.number ? 'test_' + cardDetails.number : null;
                adyenMethod.encryptedExpiryMonth = cardDetails.expiryMonth ? 'test_' + cardDetails.expiryMonth.toString() : null;
                adyenMethod.encryptedExpiryYear = cardDetails.expiryYear ? 'test_' + cardDetails.expiryYear.toString() : null;
                adyenMethod.encryptedSecurityCode = cardDetails.cvc ? 'test_' + cardDetails.cvc : null;
            } else {
                adyenMethod.number = cardDetails.number;
                adyenMethod.expiryMonth = cardDetails.expiryMonth.toString();
                adyenMethod.expiryYear = cardDetails.expiryYear.toString();
                adyenMethod.cvc = cardDetails.cvc;
            }
        }
        return adyenMethod;
    }

    private static mapAdyenResultCodeToPaymentStatus(resultCode: AdyenPaymentResultCode): PaymentStatus {
        switch (resultCode) {
            // TODO: Check if we need to map all the result codes to the correct payment status
            case AdyenPaymentResultCode.AUTHORISED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.AUTHENTICATION_FINISHED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.AUTHENTICATION_NOT_REQUIRED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.PARTIALLY_AUTHORISED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.REFUSED:
                return PaymentStatus.REFUSED;
            case AdyenPaymentResultCode.CANCELLED:
                return PaymentStatus.REFUSED;
            case AdyenPaymentResultCode.ERROR:
                return PaymentStatus.REFUSED;
            default:
                return PaymentStatus.REFUSED;
        }
    }

} 
import { PaymentMethod } from "@fugata/shared";

class AdyenPaymentMethodMap {
    adyenMethod: string;
    paymentMethod: PaymentMethod;
}

export function getAdyenPaymentMethod(paymentMethod: PaymentMethod): string {
    const method = AdyenPaymentMethods.find(method => method.paymentMethod === paymentMethod);
    if (!method) {
        throw {
            statusCode: 500,
            message: `Payment method ${paymentMethod} not supported for Adyen`,
        };
    }
    return method.adyenMethod;
}

export function getPaymentMethod(adyenMethod: string): PaymentMethod {
    const method = AdyenPaymentMethods.find(method => method.adyenMethod === adyenMethod);
    if (!method) {
        throw {
            statusCode: 500,
            message: `Payment method ${adyenMethod} not supported for Adyen`,
        };
    }
    return method.paymentMethod;
}

const AdyenPaymentMethods: AdyenPaymentMethodMap[] = [
        // Card payment methods
        {adyenMethod:  'scheme', paymentMethod:  PaymentMethod.CARD },// Credit and debit cards
        {adyenMethod:  'amex', paymentMethod:  PaymentMethod.AMEX }, // American Express
        {adyenMethod:  'diners', paymentMethod:  PaymentMethod.DINERS }, // Diners Club
        {adyenMethod:  'discover', paymentMethod:  PaymentMethod.DISCOVER }, // Discover
        {adyenMethod:  'jcb', paymentMethod:  PaymentMethod.JCB }, // JCB
        {adyenMethod:  'maestro', paymentMethod:  PaymentMethod.MAESTRO }, // Maestro
        {adyenMethod:  'mastercard', paymentMethod: PaymentMethod.MASTERCARD }, // Mastercard
        {adyenMethod:  'visa', paymentMethod: PaymentMethod.VISA }, // Visa
      
        // Direct Debit Methods
        {adyenMethod:  'ach', paymentMethod: PaymentMethod.ACH_DIRECT_DEBIT }, // ACH Direct Debit for US bank accounts
        {adyenMethod:  'directdebit_GB', paymentMethod: PaymentMethod.BACS_DIRECT_DEBIT }, // Bacs Direct Debit for UK bank accounts
        {adyenMethod:  'sepadirectdebit', paymentMethod: PaymentMethod.SEPA_DIRECT_DEBIT }, // SEPA Direct Debit

        // Digital wallets
        {adyenMethod:  'applepay', paymentMethod: PaymentMethod.APPLE_PAY }, // Apple Pay
        {adyenMethod:  'googlepay', paymentMethod: PaymentMethod.GOOGLE_PAY }, // Google Pay
        {adyenMethod:  'samsungpay', paymentMethod: PaymentMethod.SAMSUNG_PAY }, // Samsung Pay
        {adyenMethod:  'wechatpay', paymentMethod: PaymentMethod.WECHAT_PAY }, // WeChat Pay
        {adyenMethod:  'alipay', paymentMethod: PaymentMethod.ALIPAY }, // Alipay
        {adyenMethod:  'paypal', paymentMethod: PaymentMethod.PAYPAL }, // PayPal
      
        // Buy now, pay later
        {adyenMethod:  'affirm', paymentMethod: PaymentMethod.AFFIRM }, // Affirm
        {adyenMethod:  'afterpay', paymentMethod: PaymentMethod.AFTERPAY }, // Afterpay
        {adyenMethod:  'alma', paymentMethod: PaymentMethod.ALMA }, // Alma
        {adyenMethod:  'clearpay', paymentMethod: PaymentMethod.CLEARPAY }, // Clearpay
        {adyenMethod:  'klarna', paymentMethod: PaymentMethod.KLARNA }, // Klarna
        {adyenMethod:  'zip', paymentMethod: PaymentMethod.ZIP }, // Zip
      
        // Bank redirect methods
        {adyenMethod:  'ideal', paymentMethod: PaymentMethod.IDEAL }, // iDEAL
        {adyenMethod:  'sofort', paymentMethod: PaymentMethod.SOFORT }, // SOFORT
        {adyenMethod:  'giropay', paymentMethod: PaymentMethod.GIROPAY }, // giropay
        {adyenMethod:  'bcmc', paymentMethod: PaymentMethod.BANCONTACT }, // Bancontact
        {adyenMethod:  'eps', paymentMethod: PaymentMethod.EPS }, // EPS
        {adyenMethod:  'onlineBanking_PL', paymentMethod: PaymentMethod.P24 }, // Przelewy24
        {adyenMethod:  'multibanco', paymentMethod: PaymentMethod.MULTIBANCO }, // Multibanco
      
        // Local payment methods
        {adyenMethod:  'boleto', paymentMethod: PaymentMethod.BOLETO }, // Boleto
        {adyenMethod:  'oxxo', paymentMethod: PaymentMethod.OXXO }, // OXXO
        {adyenMethod:  'pix', paymentMethod: PaymentMethod.PIX }, // PIX
        {adyenMethod:  'promptpay', paymentMethod: PaymentMethod.PROMPTPAY }, // PromptPay
        {adyenMethod:  'blik', paymentMethod: PaymentMethod.BLIK }, // BLIK
        {adyenMethod:  'konbini', paymentMethod: PaymentMethod.KONBINI }, // Konbini
        {adyenMethod:  'paynow', paymentMethod: PaymentMethod.PAYNOW }, // PayNow
        {adyenMethod:  'grabpay', paymentMethod: PaymentMethod.GRABPAY }, // GrabPay
        {adyenMethod:  'kakaopay', paymentMethod: PaymentMethod.KAKAO_PAY }, // KakaoPay
        {adyenMethod:  'kcp_naverpay', paymentMethod: PaymentMethod.NAVER_PAY }, // NaverPay
        {adyenMethod:  'kcp_payco', paymentMethod: PaymentMethod.PAYCO }, // Payco
        {adyenMethod:  'molpay_ebanking_fpx_MY', paymentMethod: PaymentMethod.FPX }, // FPX Malaysia
        {adyenMethod:  'interac_card', paymentMethod: PaymentMethod.INTERAC }, // Interac Canada
        {adyenMethod:  'interac', paymentMethod: PaymentMethod.INTERAC_ONLINE }, // Interac Canada
        {adyenMethod:  'cartebancaire', paymentMethod: PaymentMethod.CARTES_BANCAIRES }, // Cartes Bancaires France

        // Mobile payment methods
        {adyenMethod:  'mobilepay', paymentMethod: PaymentMethod.MOBILEPAY }, // MobilePay
        {adyenMethod:  'swish', paymentMethod: PaymentMethod.SWISH }, // Swish
        {adyenMethod:  'twint', paymentMethod: PaymentMethod.TWINT }, // TWINT
    
]

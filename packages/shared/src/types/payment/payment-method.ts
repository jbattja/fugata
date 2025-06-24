export enum PaymentMethod {
    // Card Schemes
    CARD = 'CARD', // generic credit and debit cards
    AMEX = 'AMEX', // American Express
    DINERS = 'DINERS', // Diners Club
    DISCOVER = 'DISCOVER', // Discover
    JCB = 'JCB', // JCB
    CUP = 'CUP', // China UnionPay
    MAESTRO = 'MAESTRO', // Maestro
    MASTERCARD = 'MASTERCARD', // Mastercard
    VISA = 'VISA', // Visa
    CARTES_BANCAIRES = 'CARTES_BANCAIRES', // Cartes Bancaires France

    // Digital wallets
    APPLE_PAY = 'APPLE_PAY', // Apple Pay
    GOOGLE_PAY = 'GOOGLE_PAY', // Google Pay
    SAMSUNG_PAY = 'SAMSUNG_PAY', // Samsung Pay
    WECHAT_PAY = 'WECHAT_PAY', // WeChat Pay
    ALIPAY = 'ALIPAY', // Alipay
    PAYPAL = 'PAYPAL', // PayPal
    AMAZON_PAY = 'AMAZON_PAY', // Amazon Pay
    CASHAPP = 'CASHAPP', // Cash App
    KAKAO_PAY = 'KAKAO_PAY', // KakaoPay Korea
    NAVER_PAY = 'NAVER_PAY', // NaverPay Korea
    PAYCO = 'PAYCO', // Payco Korea
    GRABPAY = 'GRABPAY', // GrabPay
    MOBILEPAY = 'MOBILEPAY', // MobilePay Denmark
    SWISH = 'SWISH', // Swish Sweden
    SATISPAY = 'SATISPAY', // SatisPay Italy
    TWINT = 'TWINT', // TWINT Switzerland

    // Buy now, pay later
    AFFIRM = 'AFFIRM', // Affirm
    AFTERPAY = 'AFTERPAY', // Afterpay
    ALMA = 'ALMA', // Alma
    BILLIE = 'BILLIE', // Billie
    CLEARPAY = 'CLEARPAY', // Clearpay
    KLARNA = 'KLARNA', // Klarna
    ZIP = 'ZIP', // Zip

    // Local networks
    PIX = 'PIX', // PIX
    PROMPTPAY = 'PROMPTPAY', // PromptPay
    BLIK = 'BLIK', // BLIK
    FPX = 'FPX', // FPX Malaysia
    PAYNOW = 'PAYNOW', // PayNow
    INTERAC = 'INTERAC', // Interac Canada
    INTERAC_ONLINE = 'INTERAC_ONLINE', // Interac Online
    
      // Direct Debit Methods
    SEPA_DIRECT_DEBIT = 'SEPA_DIRECT_DEBIT', // SEPA Direct Debit
    ACH_DIRECT_DEBIT = 'ACH_DIRECT_DEBIT', // ACH Direct Debit for US bank accounts
    BACS_DIRECT_DEBIT = 'BACS_DIRECT_DEBIT', // Bacs Direct Debit for UK bank accounts
    BECS_DIRECT_DEBIT = 'BECS_DIRECT_DEBIT', // BECS Direct Debit for Australian bank accounts
    ACSS_DIRECT_DEBIT = 'ACSS_DIRECT_DEBIT', // Pre-authorized debit payments for Canadian bank accounts
  
    // Bank redirect methods
    IDEAL = 'IDEAL', // iDEAL
    SOFORT = 'SOFORT', // SOFORT
    GIROPAY = 'GIROPAY', // giropay
    BANCONTACT = 'BANCONTACT', // Bancontact
    EPS = 'EPS', // EPS
    P24 = 'P24', // Przelewy24
    MULTIBANCO = 'MULTIBANCO', // Multibanco
  
    // cash and convernience stores
    BOLETO = 'BOLETO', // Boleto
    OXXO = 'OXXO', // OXXO
    KONBINI = 'KONBINI', // Konbini

} 

export enum CardNetwork {
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
    AMEX = 'AMEX',
    DINERS = 'DINERS',
    DISCOVER = 'DISCOVER',
    JCB = 'JCB',
    CUP = 'CUP',
}

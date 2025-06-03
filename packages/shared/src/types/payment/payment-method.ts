export enum PaymentMethod {
    // Card Schemes
    CARD = 'scheme', // generic credit and debit cards
    AMEX = 'amex', // American Express
    DINERS = 'diners', // Diners Club
    DISCOVER = 'discover', // Discover
    JCB = 'jcb', // JCB
    CUP = 'cup', // China UnionPay
    MAESTRO = 'maestro', // Maestro
    MASTERCARD = 'mastercard', // Mastercard
    VISA = 'visa', // Visa
    CARTES_BANCAIRES = 'cartes_bancaires', // Cartes Bancaires France

    // Digital wallets
    APPLE_PAY = 'applepay', // Apple Pay
    GOOGLE_PAY = 'googlepay', // Google Pay
    SAMSUNG_PAY = 'samsungpay', // Samsung Pay
    WECHAT_PAY = 'wechatpay', // WeChat Pay
    ALIPAY = 'alipay', // Alipay
    PAYPAL = 'paypal', // PayPal
    AMAZON_PAY = 'amazon_pay', // Amazon Pay
    CASHAPP = 'cashapp', // Cash App
    KAKAO_PAY = 'kakaopay', // KakaoPay Korea
    NAVER_PAY = 'naverpay', // NaverPay Korea
    PAYCO = 'payco', // Payco Korea
    GRABPAY = 'grabpay', // GrabPay
    MOBILEPAY = 'mobilepay', // MobilePay Denmark
    SWISH = 'swish', // Swish Sweden
    SATISPAY = 'satispay', // SatisPay Italy
    TWINT = 'twint', // TWINT Switzerland

    // Buy now, pay later
    AFFIRM = 'affirm', // Affirm
    AFTERPAY = 'afterpay', // Afterpay
    ALMA = 'alma', // Alma
    BILLIE = 'billie', // Billie
    CLEARPAY = 'clearpay', // Clearpay
    KLARNA = 'klarna', // Klarna
    ZIP = 'zip', // Zip

    // Local networks
    PIX = 'pix', // PIX
    PROMPTPAY = 'promptpay', // PromptPay
    BLIK = 'blik', // BLIK
    FPX = 'fpx', // FPX Malaysia
    PAYNOW = 'paynow', // PayNow
    INTERAC = 'interac', // Interac Canada
    INTERAC_ONLINE = 'interac_online', // Interac Online
    
      // Direct Debit Methods
    SEPA_DIRECT_DEBIT = 'sepa_direct_debit', // SEPA Direct Debit
    ACH_DIRECT_DEBIT = 'ach_direct_debit', // ACH Direct Debit for US bank accounts
    BACS_DIRECT_DEBIT = 'bacs_direct_debit', // Bacs Direct Debit for UK bank accounts
    BECS_DIRECT_DEBIT = 'becs_direct_debit', // BECS Direct Debit for Australian bank accounts
    ACSS_DIRECT_DEBIT = 'acss_direct_debit', // Pre-authorized debit payments for Canadian bank accounts
  
    // Bank redirect methods
    IDEAL = 'ideal', // iDEAL
    SOFORT = 'sofort', // SOFORT
    GIROPAY = 'giropay', // giropay
    BANCONTACT = 'bancontact', // Bancontact
    EPS = 'eps', // EPS
    P24 = 'p24', // Przelewy24
    MULTIBANCO = 'multibanco', // Multibanco
  
    // cash and convernience stores
    BOLETO = 'boleto', // Boleto
    OXXO = 'oxxo', // OXXO
    KONBINI = 'konbini', // Konbini

} 
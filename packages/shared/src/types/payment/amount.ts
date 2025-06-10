import { IsEnum, IsNumber } from 'class-validator';

/**
 * Enum representing all supported currencies with their minor unit decimals.
 * Based on Adyen's currency codes table with minor units information.
 * Note: Some currencies have different minor units in ISO 4217 standard than shown here.
 * For example, ISK has 0 decimals in ISO 4217 but 2 decimals in Adyen.
 */
export enum Currency {
  AED = 'AED', // UAE Dirham (2)
  ALL = 'ALL', // Albanian Lek (2)
  AMD = 'AMD', // Armenian Dram (2)
  AOA = 'AOA', // Angolan Kwanza (2)
  ARS = 'ARS', // Argentine Peso (2)
  AUD = 'AUD', // Australian Dollar (2)
  AWG = 'AWG', // Aruban Guilder (2)
  AZN = 'AZN', // Azerbaijani manat (2)
  BAM = 'BAM', // Bosnia and Herzegovina Convertible Marks (2)
  BBD = 'BBD', // Barbados Dollar (2)
  BDT = 'BDT', // Bangladesh Taka (2)
  BGN = 'BGN', // New Bulgarian Lev (2)
  BHD = 'BHD', // Bahraini Dinar (3)
  BMD = 'BMD', // Bermudian Dollar (2)
  BND = 'BND', // Brunei Dollar (2)
  BOB = 'BOB', // Bolivia Boliviano (2)
  BRL = 'BRL', // Brazilian Real (2)
  BSD = 'BSD', // Bahamian Dollar (2)
  BWP = 'BWP', // Botswana Pula (2)
  BYN = 'BYN', // New Belarusian Ruble (2)
  BZD = 'BZD', // Belize Dollar (2)
  CAD = 'CAD', // Canadian Dollar (2)
  CHF = 'CHF', // Swiss Franc (2)
  CLP = 'CLP', // Chilean Peso (2) - Note: Differs from ISO 4217 standard
  CNH = 'CNH', // Yuan Renminbi (offshore) (2)
  CNY = 'CNY', // Yuan Renminbi (onshore) (2)
  COP = 'COP', // Colombian Peso (2)
  CRC = 'CRC', // Costa Rican Colon (2)
  CUP = 'CUP', // Cuban Peso (2)
  CVE = 'CVE', // Cape Verdi Escudo (0) - Note: Differs from ISO 4217 standard
  CZK = 'CZK', // Czech Koruna (2)
  DJF = 'DJF', // Djibouti Franc (0)
  DKK = 'DKK', // Danish Krone (2)
  DOP = 'DOP', // Dominican Republic Peso (2)
  DZD = 'DZD', // Algerian Dinar (2)
  EGP = 'EGP', // Egyptian Pound (2)
  ETB = 'ETB', // Ethiopian Birr (2)
  EUR = 'EUR', // Euro (2)
  FJD = 'FJD', // Fiji Dollar (2)
  FKP = 'FKP', // Falkland Islands Pound (2)
  GBP = 'GBP', // Pound Sterling (2)
  GEL = 'GEL', // Georgian Lari (2)
  GHS = 'GHS', // Ghanaian Cedi (2)
  GIP = 'GIP', // Gibraltar Pound (2)
  GMD = 'GMD', // Gambia Delasi (2)
  GNF = 'GNF', // Guinea Franc (0)
  GTQ = 'GTQ', // Guatemala Quetzal (2)
  GYD = 'GYD', // Guyanese Dollar (2)
  HKD = 'HKD', // Hong Kong Dollar (2)
  HNL = 'HNL', // Honduras Lempira (2)
  HTG = 'HTG', // Haitian Gourde (2)
  HUF = 'HUF', // Hungarian Forint (2)
  IDR = 'IDR', // Indonesian Rupiah (0) - Note: Differs from ISO 4217 standard
  ILS = 'ILS', // New Israeli Scheqel (2)
  INR = 'INR', // Indian Rupee (2)
  IQD = 'IQD', // Iraqi Dinar (3)
  ISK = 'ISK', // Iceland Krona (2) - Note: Differs from ISO 4217 standard
  JMD = 'JMD', // Jamaican Dollar (2)
  JOD = 'JOD', // Jordanian Dinar (3)
  JPY = 'JPY', // Japanese Yen (0)
  KES = 'KES', // Kenyan Shilling (2)
  KGS = 'KGS', // Kyrgyzstan Som (2)
  KHR = 'KHR', // Cambodia Riel (2)
  KMF = 'KMF', // Comoro Franc (0)
  KRW = 'KRW', // South-Korean Won (0)
  KWD = 'KWD', // Kuwaiti Dinar (3)
  KYD = 'KYD', // Cayman Islands Dollar (2)
  KZT = 'KZT', // Kazakhstani Tenge (2)
  LAK = 'LAK', // Laos Kip (2)
  LBP = 'LBP', // Lebanese Pound (2)
  LKR = 'LKR', // Sri Lanka Rupee (2)
  LYD = 'LYD', // Libyan Dinar (3)
  MAD = 'MAD', // Moroccan Dirham (2)
  MDL = 'MDL', // Moldovia Leu (2)
  MKD = 'MKD', // Macedonian Denar (2)
  MMK = 'MMK', // Myanmar Kyat (2)
  MNT = 'MNT', // Mongolia Tugrik (2)
  MOP = 'MOP', // Macau Pataca (2)
  MRU = 'MRU', // Mauritania Ouguiya (2)
  MUR = 'MUR', // Mauritius Rupee (2)
  MVR = 'MVR', // Maldives Rufiyaa (2)
  MWK = 'MWK', // Malawi Kwacha (2)
  MXN = 'MXN', // Mexican Peso (2)
  MYR = 'MYR', // Malaysian Ringgit (2)
  MZN = 'MZN', // Mozambican Metical (2)
  NAD = 'NAD', // Namibian Dollar (2)
  NGN = 'NGN', // Nigerian Naira (2)
  NIO = 'NIO', // Nicaragua Cordoba Oro (2)
  NOK = 'NOK', // Norwegian Krone (2)
  NPR = 'NPR', // Nepalese Rupee (2)
  NZD = 'NZD', // New Zealand Dollar (2)
  OMR = 'OMR', // Rial Omani (3)
  PAB = 'PAB', // Panamanian Balboa (2)
  PEN = 'PEN', // Peruvian Nuevo Sol (2)
  PGK = 'PGK', // New Guinea Kina (2)
  PHP = 'PHP', // Philippine Peso (2)
  PKR = 'PKR', // Pakistan Rupee (2)
  PLN = 'PLN', // New Polish Zloty (2)
  PYG = 'PYG', // Paraguay Guarani (0)
  QAR = 'QAR', // Qatari Rial (2)
  RON = 'RON', // New Romanian Lei (2)
  RSD = 'RSD', // Serbian Dinar (2)
  RUB = 'RUB', // Russian Ruble (2)
  RWF = 'RWF', // Rwanda Franc (0)
  SAR = 'SAR', // Saudi Riyal (2)
  SBD = 'SBD', // Solomon Island Dollar (2)
  SCR = 'SCR', // Seychelles Rupee (2)
  SEK = 'SEK', // Swedish Krone (2)
  SGD = 'SGD', // Singapore Dollar (2)
  SHP = 'SHP', // St. Helena Pound (2)
  SLE = 'SLE', // Sierra Leone Leone (2)
  SOS = 'SOS', // Somalia Shilling (2)
  SRD = 'SRD', // Surinamese dollar (2)
  STN = 'STN', // Sao Tome & Principe Dobra (2)
  SVC = 'SVC', // El Salvador Colón (2)
  SZL = 'SZL', // Swaziland Lilangeni (2)
  THB = 'THB', // Thai Baht (2)
  TND = 'TND', // Tunisian Dinar (3)
  TOP = 'TOP', // Tonga Pa'anga (2)
  TRY = 'TRY', // New Turkish Lira (2)
  TTD = 'TTD', // Trinidad & Tobago Dollar (2)
  TWD = 'TWD', // New Taiwan Dollar (2)
  TZS = 'TZS', // Tanzanian Shilling (2)
  UAH = 'UAH', // Ukraine Hryvnia (2)
  UGX = 'UGX', // Uganda Shilling (0)
  USD = 'USD', // US Dollars (2)
  UYU = 'UYU', // Peso Uruguayo (2)
  UZS = 'UZS', // Uzbekistani Som (2)
  VEF = 'VEF', // Venezuelan Bolívar (2)
  VND = 'VND', // Vietnamese New Dong (0)
  VUV = 'VUV', // Vanuatu Vatu (0)
  WST = 'WST', // Samoan Tala (2)
  XAF = 'XAF', // CFA Franc BEAC (0)
  XCD = 'XCD', // East Caribbean Dollar (2)
  XOF = 'XOF', // CFA Franc BCEAO (0)
  XPF = 'XPF', // CFP Franc (0)
  YER = 'YER', // Yemeni Rial (2)
  ZAR = 'ZAR', // South African Rand (2)
  ZMW = 'ZMW'  // Zambian Kwacha (2)
}

/**
 * Map of currency codes to their minor unit decimals
 */
export const CURRENCY_MINOR_UNITS: Record<Currency, number> = {
  [Currency.AED]: 2,
  [Currency.ALL]: 2,
  [Currency.AMD]: 2,
  [Currency.AOA]: 2,
  [Currency.ARS]: 2,
  [Currency.AUD]: 2,
  [Currency.AWG]: 2,
  [Currency.AZN]: 2,
  [Currency.BAM]: 2,
  [Currency.BBD]: 2,
  [Currency.BDT]: 2,
  [Currency.BGN]: 2,
  [Currency.BHD]: 3,
  [Currency.BMD]: 2,
  [Currency.BND]: 2,
  [Currency.BOB]: 2,
  [Currency.BRL]: 2,
  [Currency.BSD]: 2,
  [Currency.BWP]: 2,
  [Currency.BYN]: 2,
  [Currency.BZD]: 2,
  [Currency.CAD]: 2,
  [Currency.CHF]: 2,
  [Currency.CLP]: 2,
  [Currency.CNH]: 2,
  [Currency.CNY]: 2,
  [Currency.COP]: 2,
  [Currency.CRC]: 2,
  [Currency.CUP]: 2,
  [Currency.CVE]: 0,
  [Currency.CZK]: 2,
  [Currency.DJF]: 0,
  [Currency.DKK]: 2,
  [Currency.DOP]: 2,
  [Currency.DZD]: 2,
  [Currency.EGP]: 2,
  [Currency.ETB]: 2,
  [Currency.EUR]: 2,
  [Currency.FJD]: 2,
  [Currency.FKP]: 2,
  [Currency.GBP]: 2,
  [Currency.GEL]: 2,
  [Currency.GHS]: 2,
  [Currency.GIP]: 2,
  [Currency.GMD]: 2,
  [Currency.GNF]: 0,
  [Currency.GTQ]: 2,
  [Currency.GYD]: 2,
  [Currency.HKD]: 2,
  [Currency.HNL]: 2,
  [Currency.HTG]: 2,
  [Currency.HUF]: 2,
  [Currency.IDR]: 0,
  [Currency.ILS]: 2,
  [Currency.INR]: 2,
  [Currency.IQD]: 3,
  [Currency.ISK]: 2,
  [Currency.JMD]: 2,
  [Currency.JOD]: 3,
  [Currency.JPY]: 0,
  [Currency.KES]: 2,
  [Currency.KGS]: 2,
  [Currency.KHR]: 2,
  [Currency.KMF]: 0,
  [Currency.KRW]: 0,
  [Currency.KWD]: 3,
  [Currency.KYD]: 2,
  [Currency.KZT]: 2,
  [Currency.LAK]: 2,
  [Currency.LBP]: 2,
  [Currency.LKR]: 2,
  [Currency.LYD]: 3,
  [Currency.MAD]: 2,
  [Currency.MDL]: 2,
  [Currency.MKD]: 2,
  [Currency.MMK]: 2,
  [Currency.MNT]: 2,
  [Currency.MOP]: 2,
  [Currency.MRU]: 2,
  [Currency.MUR]: 2,
  [Currency.MVR]: 2,
  [Currency.MWK]: 2,
  [Currency.MXN]: 2,
  [Currency.MYR]: 2,
  [Currency.MZN]: 2,
  [Currency.NAD]: 2,
  [Currency.NGN]: 2,
  [Currency.NIO]: 2,
  [Currency.NOK]: 2,
  [Currency.NPR]: 2,
  [Currency.NZD]: 2,
  [Currency.OMR]: 3,
  [Currency.PAB]: 2,
  [Currency.PEN]: 2,
  [Currency.PGK]: 2,
  [Currency.PHP]: 2,
  [Currency.PKR]: 2,
  [Currency.PLN]: 2,
  [Currency.PYG]: 0,
  [Currency.QAR]: 2,
  [Currency.RON]: 2,
  [Currency.RSD]: 2,
  [Currency.RUB]: 2,
  [Currency.RWF]: 0,
  [Currency.SAR]: 2,
  [Currency.SBD]: 2,
  [Currency.SCR]: 2,
  [Currency.SEK]: 2,
  [Currency.SGD]: 2,
  [Currency.SHP]: 2,
  [Currency.SLE]: 2,
  [Currency.SOS]: 2,
  [Currency.SRD]: 2,
  [Currency.STN]: 2,
  [Currency.SVC]: 2,
  [Currency.SZL]: 2,
  [Currency.THB]: 2,
  [Currency.TND]: 3,
  [Currency.TOP]: 2,
  [Currency.TRY]: 2,
  [Currency.TTD]: 2,
  [Currency.TWD]: 2,
  [Currency.TZS]: 2,
  [Currency.UAH]: 2,
  [Currency.UGX]: 0,
  [Currency.USD]: 2,
  [Currency.UYU]: 2,
  [Currency.UZS]: 2,
  [Currency.VEF]: 2,
  [Currency.VND]: 0,
  [Currency.VUV]: 0,
  [Currency.WST]: 2,
  [Currency.XAF]: 0,
  [Currency.XCD]: 2,
  [Currency.XOF]: 0,
  [Currency.XPF]: 0,
  [Currency.YER]: 2,
  [Currency.ZAR]: 2,
  [Currency.ZMW]: 2
};

/**
 * Class representing a monetary amount with its currency
 */
export class Amount {
  @IsNumber()
  value: number;

  @IsEnum(Currency)
  currency: Currency;

  constructor(amount: number, currency: Currency) {
    this.value = amount;
    this.currency = currency;
  }

  /**
   * Converts the amount to minor units based on the currency's decimal places
   * @returns The amount in minor units
   */
  toMinorUnits(): number {
    const decimals = CURRENCY_MINOR_UNITS[this.currency];
    return Math.round(this.value * Math.pow(10, decimals));
  }

  /**
   * Creates a Amount instance from minor units
   * @param minorUnits The amount in minor units
   * @param currency The currency
   * @returns A new Amount instance
   */
  static fromMinorUnits(minorUnits: number, currency: Currency): Amount {
    const decimals = CURRENCY_MINOR_UNITS[currency];
    const amount = minorUnits / Math.pow(10, decimals);
    return new Amount(amount, currency);
  }

  /**
   * Formats the amount according to the currency's decimal places
   * @returns Formatted string representation of the amount
   */
  toString(): string {
    const decimals = CURRENCY_MINOR_UNITS[this.currency];
    return `${this.currency} ${this.value.toFixed(decimals)}`;
  }
} 
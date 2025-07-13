import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PartnerInterface } from './interfaces/partner.interface';
import { DemoPartner } from './partners/demo-partner/demo-partner';
import { AdyenCheckout } from './partners/adyen-checkout/adyen-checkout';
import { StripePaymentIntent } from './partners/stripe-payment-intent/stripe-payment-intent';

@Injectable()
export class PartnerRegistryService implements OnModuleInit {
  private partners: Map<string, PartnerInterface> = new Map();

  async onModuleInit() {
    // Register default partners
    await this.registerDefaultPartners();
  }

  private async registerDefaultPartners() {
    // Register demo partner
    this.registerPartner(new DemoPartner());
    // Register Adyen checkout partner
    this.registerPartner(new AdyenCheckout());
    // Register Stripe payment intent partner
    this.registerPartner(new StripePaymentIntent());
  }

  registerPartner(partner: PartnerInterface): void {
    Logger.log(`Registering partner ${partner.partnerName}`, PartnerRegistryService.name);
    this.partners.set(partner.partnerName, partner);
  }

  getPartner(name: string): PartnerInterface | undefined {
    return this.partners.get(name);
  }

} 
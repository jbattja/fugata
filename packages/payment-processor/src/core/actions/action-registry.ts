import { ActionInterface } from '../types/workflow.types';
import { InitiatePaymentAction } from './initiate-payment-action';
import { TerminateAction } from './terminate-action';
import { FraudScoreAction } from './fraudscore-action';
import { AuthenticateAction } from './authenticate-action';
import { AuthorizeAction } from './authorize-action';
import { CaptureAction } from './capture-action';
import { VoidAction } from './void-action';
import { RefundAction } from './refund-action';
import { PartnerCommunicatorClient, SettingsClient, TokenVaultClient } from '@fugata/shared';
import { PaymentProducerService } from '../../kafka/payment-producer.service';

export enum ActionsType {
  InitiatePayment = 'InitiatePayment',
  Terminate = 'Terminate',
  FraudScore = 'FraudScore',
  Authenticate = 'Authenticate',
  Authorize = 'Authorize',
  Capture = 'Capture',
  Void = 'Void',
  Refund = 'Refund'
}

export class ActionRegistry {
  private static actions: Map<ActionsType, () => ActionInterface> = new Map();
  private static partnerCommunicatorClient: PartnerCommunicatorClient | null = null;
  private static settingsClient: SettingsClient | null = null;
  private static paymentProducer: PaymentProducerService | null = null;
  private static tokenVaultClient: TokenVaultClient | null = null;

  static {
    // Register all available actions
    ActionRegistry.register(ActionsType.InitiatePayment, () => new InitiatePaymentAction());
    ActionRegistry.register(ActionsType.Terminate, () => new TerminateAction());
    ActionRegistry.register(ActionsType.FraudScore, () => new FraudScoreAction());
    ActionRegistry.register(ActionsType.Authenticate, () => new AuthenticateAction());
    ActionRegistry.register(ActionsType.Authorize, () => new AuthorizeAction());
    ActionRegistry.register(ActionsType.Capture, () => new CaptureAction());
    ActionRegistry.register(ActionsType.Void, () => new VoidAction());
    ActionRegistry.register(ActionsType.Refund, () => new RefundAction());
  }

  static register(action: ActionsType, actionFactory: () => ActionInterface): void {
    ActionRegistry.actions.set(action, actionFactory);
  }

  static setPartnerCommunicatorClient(client: PartnerCommunicatorClient): void {
    ActionRegistry.partnerCommunicatorClient = client;
  }

  static getPartnerCommunicatorClient(): PartnerCommunicatorClient | null {
    return ActionRegistry.partnerCommunicatorClient;
  }

  static setSettingsClient(client: SettingsClient): void {
    ActionRegistry.settingsClient = client;
  }

  static getSettingsClient(): SettingsClient | null {
    return ActionRegistry.settingsClient;
  }

  static setPaymentProducer(producer: PaymentProducerService): void {
    ActionRegistry.paymentProducer = producer;
  }

  static getPaymentProducer(): PaymentProducerService | null {
    return ActionRegistry.paymentProducer;
  }

  static setTokenVaultClient(client: TokenVaultClient): void {
    ActionRegistry.tokenVaultClient = client;
  }

  static getTokenVaultClient(): TokenVaultClient | null {
    return ActionRegistry.tokenVaultClient;
  }

  static getAction(action: ActionsType): ActionInterface | null {
    const actionFactory = ActionRegistry.actions.get(action);
    if (!actionFactory) {
      return null;
    }
    return actionFactory();
  }
} 

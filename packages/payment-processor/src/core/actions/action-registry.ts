import { ActionInterface } from '../types/workflow.types';
import { InitiatePaymentAction } from './initiate-payment-action';
import { TerminateAction } from './terminate-action';
import { FraudScoreAction } from './fraudscore-action';
import { AuthenticateAction } from './authenticate-action';
import { AuthorizeAction } from './authorize-action';
import { CaptureAction } from './capture-action';
import { VoidAction } from './void-action';
import { RefundAction } from './refund-action';

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
  private static actions: Map<ActionsType, new () => ActionInterface> = new Map();

  static {
    // Register all available actions
    ActionRegistry.register(ActionsType.InitiatePayment, InitiatePaymentAction);
    ActionRegistry.register(ActionsType.Terminate, TerminateAction);
    ActionRegistry.register(ActionsType.FraudScore, FraudScoreAction);
    ActionRegistry.register(ActionsType.Authenticate, AuthenticateAction);
    ActionRegistry.register(ActionsType.Authorize, AuthorizeAction);
    ActionRegistry.register(ActionsType.Capture, CaptureAction);
    ActionRegistry.register(ActionsType.Void, VoidAction);
    ActionRegistry.register(ActionsType.Refund, RefundAction);
  }

  static register(action: ActionsType, actionClass: new () => ActionInterface): void {
    ActionRegistry.actions.set(action, actionClass);
  }

  static getAction(action: ActionsType): ActionInterface | null {
    const ActionClass = ActionRegistry.actions.get(action);
    if (!ActionClass) {
      return null;
    }
    return new ActionClass();
  }
} 

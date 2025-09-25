import { Capture, Merchant, Payment, ProviderCredential, Refund, Void, Operation } from "@fugata/shared";

export enum FraudAdvice {
  CHALLENGE = 'CHALLENGE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export interface PaymentContext {
  payment: Payment;
  merchant?: Partial<Merchant>;
  providerCredential?: Partial<ProviderCredential>;
  request: any;
  sessionId?: string;
  authorizeAttempts?: number;
  fraud?: {
    score?: number;
    advice?: FraudAdvice;
    requirePreAuthentication?: boolean;
    requirePreAuthorization?: boolean;
    requirePostAuthorization?: boolean;
  };
  authentication?: {
    done?: boolean;
    skip?: boolean;
  }
  capture?: Capture;
  captureAttempts?: number; 
  refund?: Refund;
  refundAttempts?: number;
  void?: Void;
  voidAttempts?: number;
  operations?: Operation[];
  confirmPayment?:{
    partnerName: string;
    urlParams?: Record<string, any>;
  }
  config?: {
    maxAuthorizeAttempts?: number;
    maxCaptureAttempts?: number;
    maxRefundAttempts?: number;
    maxVoidAttempts?: number;
  }
}

// Structured condition types
export type ConditionOperator = 'equals' | 'notEquals' | 'in' | 'notIn' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'exists' | 'notExists';

export interface PropertyCondition {
  path: string; // e.g., "payment.status", "merchant.capabilities"
  operator: ConditionOperator;
  value: any;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (PropertyCondition | ConditionGroup)[];
}

export type Condition = PropertyCondition | ConditionGroup;

export interface WorkflowAction {
  actionName: string;
  nextActions: NextAction[];
}

export interface NextAction {
  action: string;
  conditions: Condition | Condition[]; // Can be a single condition or array of conditions (treated as AND)
}

export interface WorkflowDefinition {
  actions: WorkflowAction[];
}

export interface WorkflowResult {
  success: boolean;
  context: PaymentContext;
  error?: string;
}

export interface ActionInterface {
  execute(context: PaymentContext): Promise<PaymentContext>;
}

export interface ConditionEvaluator {
  evaluate(condition: Condition, context: PaymentContext): boolean;
} 
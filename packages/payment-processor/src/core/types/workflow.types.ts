import { Merchant, Payment } from "@fugata/shared";

export enum FraudAdvice {
  CHALLENGE = 'CHALLENGE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export interface PaymentContext {
  payment: Payment;
  merchant?: Partial<Merchant>;
  request: any;
  authorizeAttempts?: number;
  fraud?: {
    score: number;
    advice: FraudAdvice;
  };
  capture?: any;
  captureAttempts?: number; 
  refund?: any;
  refundAttempts?: number;
  voidAttempts?: number;
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
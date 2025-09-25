import { Injectable } from '@nestjs/common';
import { AccountSettingKey, OperationStatus, PaymentStatus, SharedLogger, ThreeDSecureMode } from '@fugata/shared';
import { extractAuthHeaders } from '../clients/jwt.service';
import {
  PaymentContext,
  WorkflowDefinition,
  WorkflowResult,
  WorkflowAction,
  Condition
} from './types/workflow.types';
import { ActionRegistry, ActionsType } from './actions/action-registry';
import { WorkflowConditionEvaluator } from './condition-evaluator';
import { DEFAULT_WORKFLOW } from './workflow-definition';
import { getMerchant, Payment, SettingsClient, PartnerCommunicatorClient, TokenVaultClient, PaymentDataClient, Capture, Refund, Void } from '@fugata/shared';
import { Inject } from '@nestjs/common';
import { PaymentProducerService } from '../kafka/payment-producer.service';
import { TokenizationUtils } from './tokenization.utils';

@Injectable()
export class WorkflowOrchestrationService {
  private workflow: WorkflowDefinition;
  private conditionEvaluator: WorkflowConditionEvaluator;

  constructor(
    private settingsClient: SettingsClient,
    private partnerCommunicatorClient: PartnerCommunicatorClient,
    @Inject(PaymentProducerService) private paymentProducer: PaymentProducerService,
    private tokenVaultClient: TokenVaultClient,
    private paymentDataClient: PaymentDataClient
  ) {
    this.workflow = DEFAULT_WORKFLOW;
    this.conditionEvaluator = new WorkflowConditionEvaluator();

    // Set all clients in the action registry
    ActionRegistry.setPartnerCommunicatorClient(this.partnerCommunicatorClient);
    ActionRegistry.setSettingsClient(this.settingsClient);
    ActionRegistry.setPaymentProducer(this.paymentProducer);
    ActionRegistry.setTokenVaultClient(this.tokenVaultClient);
  }

  /**
   * Set a custom workflow definition
   */
  setWorkflow(workflow: WorkflowDefinition): void {
    this.workflow = workflow;
  }

  /**
   * Get the current workflow definition
   */
  getWorkflow(): WorkflowDefinition {
    return this.workflow;
  }

  /**
   * Execute the payment workflow
   */
  async executePayment(payment: Payment, request: any, sessionId?: string): Promise<WorkflowResult> {
    try {
      // Initialize payment context
      const context = await this.buildPaymentContext(payment, null, request, false);
      context.sessionId = sessionId;

      // Start with the first action (InitiatePayment)
      const result = await this.executeWorkflow(context, ActionsType.InitiatePayment);

      return {
        success: true,
        context: result
      };
    } catch (error) {
      SharedLogger.error('Workflow execution failed:', error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
   * Execute capture for an existing payment
   */
  async executeCapture(paymentId: string, capture: Capture, request: any, finalCapture: boolean): Promise<WorkflowResult> {
    try {

      const context = await this.buildPaymentContext(null,paymentId, request, true);
      context.capture = capture;

      // Execute the capture action directly
      const result = await this.executeAction(ActionsType.Capture, context);

      // If this is the final capture and the capture was successful, and the payment is partially captured, void the remaining amount
      if (finalCapture && context.capture.status === OperationStatus.SUCCEEDED && context.payment.status === PaymentStatus.PARTIALLY_CAPTURED) {
        await this.executeAction(ActionsType.Void, context);
      }
      return {
        success: true,
        context: result
      };
    } catch (error) {
      SharedLogger.error('Capture execution failed:', error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
   * Execute refund for an existing payment
   */
  async executeRefund(paymentId: string, refund: Refund, request: any): Promise<WorkflowResult> {
    try {

      const context = await this.buildPaymentContext(null,paymentId, request, true);
      context.refund = refund;

      // Execute the refund action directly
      const result = await this.executeAction(ActionsType.Refund, context);

      return {
        success: true,
        context: result
      };
    } catch (error) {
      SharedLogger.error('Refund execution failed:', error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
   * Execute void for an existing payment
   */
  async executeVoid(paymentId: string, voidOperation: Void, request: any): Promise<WorkflowResult> {
    try {
      const context = await this.buildPaymentContext(null,paymentId, request, true);
      context.void = voidOperation;

      // Execute the void action directly
      const result = await this.executeAction(ActionsType.Void, context);

      return {
        success: true,
        context: result
      };
    } catch (error) {
      SharedLogger.error('Void execution failed:', error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
 * Execute confirm payment workflow
 */
  async executeConfirmPayment(paymentId: string, partnerName: string, urlParams: Record<string, any>, request: any): Promise<WorkflowResult> {
    try {
      const context = await this.buildPaymentContext(null,paymentId, request, false);
      context.confirmPayment = {
        partnerName: partnerName,
        urlParams: urlParams
      };

      const result = await this.executeWorkflow(context, ActionsType.ConfirmPayment);


      return {
        success: true,
        context: result
      };
    } catch (error) {
      SharedLogger.error('Confirm payment workflow execution failed:', error, WorkflowOrchestrationService.name);
      throw error;
    }
  }


  /**
   * Execute workflow starting from a specific action
   */
  private async executeWorkflow(context: PaymentContext, startActionName: ActionsType): Promise<PaymentContext> {
    let currentActionName = startActionName;
    let executionCount = 0;
    const maxExecutions = 100; // Prevent infinite loops

    while (currentActionName && executionCount < maxExecutions) {
      SharedLogger.log(`Executing action: ${currentActionName}`, undefined, WorkflowOrchestrationService.name);

      // Execute the current action
      context = await this.executeAction(currentActionName, context);

      // Find the next action based on conditions
      currentActionName = this.determineNextAction(currentActionName, context);

      executionCount++;

      // If we reach Terminate, stop the workflow
      if (currentActionName === ActionsType.Terminate) {
        SharedLogger.log('Workflow terminated', undefined, WorkflowOrchestrationService.name);
        break;
      }
    }

    if (executionCount >= maxExecutions) {
      throw new Error('Maximum workflow executions reached - possible infinite loop');
    }

    // Clean up sensitive data at the end of workflow execution
    if (context.payment.paymentInstrument) {
      context.payment.paymentInstrument = TokenizationUtils.cleanUpSensitiveData(context.payment.paymentInstrument);
    }
    return context;
  }

  /**
   * Execute a specific action
   */
  private async executeAction(actionName: string, context: PaymentContext): Promise<PaymentContext> {
    if (!Object.values(ActionsType).includes(actionName as ActionsType)) {
      throw new Error(`Action '${actionName}' not a valid action`);
    }
    const action = ActionRegistry.getAction(actionName as ActionsType);

    if (!action) {
      throw new Error(`Action '${actionName}' not found in registry`);
    }

    try {
      const result = await action.execute(context);
      return result;
    } catch (error) {
      SharedLogger.error(`Action ${actionName} failed:`, error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
   * Determine the next action based on conditions
   */
  private determineNextAction(currentActionName: ActionsType, context: PaymentContext): ActionsType | null {
    const workflowAction = this.findWorkflowAction(currentActionName);

    if (!workflowAction) {
      SharedLogger.warn(`No workflow definition found for action: ${currentActionName}`, undefined, WorkflowOrchestrationService.name);
      return ActionsType.Terminate;
    }

    // Check each next action's conditions
    for (const nextAction of workflowAction.nextActions) {
      const shouldExecute = this.conditionEvaluator.evaluate(nextAction.conditions as Condition, context);
      if (shouldExecute) {
        if (!Object.values(ActionsType).includes(nextAction.action as ActionsType)) {
          throw new Error(`Action '${nextAction.action}' not a valid action`);
        }
        return nextAction.action as ActionsType;
      }
    }
    // If no conditions are met, terminate
    SharedLogger.warn('No conditions met for next actions, terminating workflow', undefined, WorkflowOrchestrationService.name);
    return ActionsType.Terminate;
  }

  private async buildPaymentContext(payment: Payment | null, paymentId: string, request: any, includeOperations: boolean = false): Promise<PaymentContext> {
    // Extract authorization headers from the request
    const authHeaders = extractAuthHeaders(request);

    if (!payment) {
      // Retrieve the payment and operations from the payment data service
      payment = await this.paymentDataClient.getPayment(authHeaders, paymentId);
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }
    }

    const context: PaymentContext = {
      payment,
      request,
    };
    const merchantId = payment.merchant && payment.merchant.id ? payment.merchant.id : getMerchant(request)?.id;
    if (merchantId) {
      context.merchant = await this.settingsClient.getMerchant(authHeaders, merchantId);
    } else {
      throw new Error('Merchant not found');
    }
    if (includeOperations) {
      const operationsResponse = await this.paymentDataClient.getOperationsForPayment(authHeaders, paymentId);
      context.operations = operationsResponse.operations;
    }

    context.authorizeAttempts = 0;
    context.captureAttempts = 0;
    context.refundAttempts = 0;
    context.voidAttempts = 0;
    context.config = {
      maxAuthorizeAttempts: 1,
      maxCaptureAttempts: 5,
      maxRefundAttempts: 5,
      maxVoidAttempts: 5
    };


    context.authentication = {
      skip: false,
      done: false // Can extend in future if we allow third party authentication
    };
    if (context.merchant?.settings?.[AccountSettingKey.ALLOW_SKIP_3DS] === true && context.payment.authenticationData?.threeDSecureMode !== ThreeDSecureMode.THREE_DS_SKIP) {
      context.authentication.skip = true;
    }

    context.fraud = { // Default risk settings: we only do pre-authentication and pre-authorization. Later to extend for different use cases or payment methods. 
      requirePreAuthentication: true,
      requirePreAuthorization: true,
      requirePostAuthorization: false
    };
    if (context.merchant?.settings?.[AccountSettingKey.ALLOW_SKIP_RISK] === true) {
      context.fraud.requirePreAuthentication = false;
      context.fraud.requirePreAuthorization = false;
      context.fraud.requirePostAuthorization = false;
    }
    return context;
  }

  /**
   * Find a workflow action by name
   */
  private findWorkflowAction(actionName: string): WorkflowAction | undefined {
    return this.workflow.actions.find(action => action.actionName === actionName);
  }
}

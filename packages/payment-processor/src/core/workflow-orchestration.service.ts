import { Injectable, Logger } from '@nestjs/common';
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
import { getMerchant, Payment, SettingsClient, PartnerCommunicatorClient } from '@fugata/shared';

@Injectable()
export class WorkflowOrchestrationService {
  private workflow: WorkflowDefinition;
  private conditionEvaluator: WorkflowConditionEvaluator;

  constructor(
    private settingsClient: SettingsClient,
    private partnerCommunicatorClient: PartnerCommunicatorClient
  ) {
    this.workflow = DEFAULT_WORKFLOW;
    this.conditionEvaluator = new WorkflowConditionEvaluator();
    
    // Set both clients in the action registry
    ActionRegistry.setPartnerCommunicatorClient(this.partnerCommunicatorClient);
    ActionRegistry.setSettingsClient(this.settingsClient);
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
  async executePayment(payment: Payment, request: any): Promise<WorkflowResult> {
    try {
      // Initialize payment context
      const context: PaymentContext = {
        payment,
        request,
      };
      
      const merchantId = payment.merchant && payment.merchant.id ? payment.merchant.id : getMerchant(request)?.id;
      if (merchantId) {
        // Extract authorization headers from the request
        const authHeaders = extractAuthHeaders(request);
        context.merchant = await this.settingsClient.getMerchant(authHeaders, merchantId);
      } else {
        throw new Error('Merchant not found');
      }
      // Start with the first action (InitiatePayment)
      const result = await this.executeWorkflow(context, ActionsType.InitiatePayment);
      
      return {
        success: true,
        context: result
      };
    } catch (error) {
      Logger.error('Workflow execution failed:', error, WorkflowOrchestrationService.name);
      return {
        success: false,
        context: { payment, request },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
      Logger.log(`Executing action: ${currentActionName}`,WorkflowOrchestrationService.name);
      
      // Execute the current action
      context = await this.executeAction(currentActionName, context);
      
      // Find the next action based on conditions
      currentActionName = this.determineNextAction(currentActionName, context);
      
      executionCount++;
      
      // If we reach Terminate, stop the workflow
      if (currentActionName === ActionsType.Terminate) {
        Logger.log('Workflow terminated',WorkflowOrchestrationService.name);
        break;
      }
    }

    if (executionCount >= maxExecutions) {
      throw new Error('Maximum workflow executions reached - possible infinite loop');
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
      Logger.error(`Action ${actionName} failed:`, error, WorkflowOrchestrationService.name);
      throw error;
    }
  }

  /**
   * Determine the next action based on conditions
   */
  private determineNextAction(currentActionName: ActionsType, context: PaymentContext): ActionsType | null {
    const workflowAction = this.findWorkflowAction(currentActionName);
    
    if (!workflowAction) {
      Logger.warn(`No workflow definition found for action: ${currentActionName}`,WorkflowOrchestrationService.name);
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
    Logger.warn('No conditions met for next actions, terminating workflow',WorkflowOrchestrationService.name);
    return ActionsType.Terminate;
  }

  /**
   * Find a workflow action by name
   */
  private findWorkflowAction(actionName: string): WorkflowAction | undefined {
    return this.workflow.actions.find(action => action.actionName === actionName);
  }
}

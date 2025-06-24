import { AccountSettingKey, ThreeDSecureMode } from '@fugata/shared';
import { WorkflowDefinition } from './types/workflow.types';

export const DEFAULT_WORKFLOW: WorkflowDefinition = {
  actions: [
    {
      actionName: "InitiatePayment",
      nextActions: [
        {
          action: "FraudScore",
          conditions: {
            path: "merchant.settings." + AccountSettingKey.ALLOW_SKIP_RISK,
            operator: "notEquals",
            value: true
          }
        },
        {
          action: "Authenticate",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "merchant.settings." + AccountSettingKey.ALLOW_SKIP_3DS,
                operator: "notEquals",
                value: true
              },
              {
                path: "payment.authenticationData.threeDSecureMode",
                operator: "notEquals",
                value: ThreeDSecureMode.THREE_DS_SKIP
              }
            ]
          }
        },
        {
          action: "Authorize",
          conditions: null // No conditions means always true
        }
      ]
    },
    {
      actionName: "FraudScore",
      nextActions: [
        {
          action: "Authenticate",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.advice",
                operator: "equals",
                value: "CHALLENGE"
              },
              {
                path: "payment.status",
                operator: "equals",
                value: "INITIATED"
              }
            ]
          }
        },
        {
          action: "Authorize",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.advice",
                operator: "in",
                value: ["APPROVE", "UNKNOWN"]
              },
              {
                path: "payment.status",
                operator: "equals",
                value: "INITIATED"
              }
            ]
          }
        },
        {
          action: "Capture",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.advice",
                operator: "in",
                value: ["APPROVE", "UNKNOWN"]
              },
              {
                path: "payment.status",
                operator: "equals",
                value: "AUTHORIZED"
              },
              {
                path: "payment.captureMethod",
                operator: "in",
                value: ["AUTOMATIC", "DELAYED"]
              }
            ]
          }
        },
        {
          action: "Void",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.advice",
                operator: "equals",
                value: "REJECT"
              },
              {
                path: "payment.status",
                operator: "equals",
                value: "AUTHORIZED"
              }
            ]
          }
        },
        {
          action: "Refund",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.advice",
                operator: "equals",
                value: "REJECT"
              },
              {
                path: "payment.status",
                operator: "equals",
                value: "CAPTURED"
              }
            ]
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    },
    {
      actionName: "Authenticate",
      nextActions: [
        {
          action: "Authorize",
          conditions: {
            path: "payment.status",
            operator: "equals",
            value: "AUTHORIZATION_PENDING"
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    },
    {
      actionName: "Authorize",
      nextActions: [
        {
          action: "Authorize",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "payment.status",
                operator: "equals",
                value: "REFUSED"
              },
              {
                path: "authorizeAttempts",
                operator: "lessThan",
                value: 5
              }
            ]
          }
        },
        {
          action: "FraudScore",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "payment.status",
                operator: "equals",
                value: "AUTHORIZED"
              },
              {
                operator: "OR",
                conditions: [
                  {
                    path: "merchant.settings.mandatePostAuthFraud",
                    operator: "equals",
                    value: true
                  },
                  {
                    path: "payment.flags.mandatePostauthFraud",
                    operator: "in",
                    value: ["mandatePostauthFraud"]
                  }
                ]
              }
            ]
          }
        },
        {
          action: "Capture",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "payment.status",
                operator: "equals",
                value: "AUTHORIZED"
              },
              {
                path: "payment.captureMethod",
                operator: "in",
                value: ["AUTOMATIC", "DELAYED"]
              }
            ]
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    },
    {
      actionName: "Capture",
      nextActions: [
        {
          action: "Capture",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "capture.status",
                operator: "equals",
                value: "CAPTURE_FAILED"
              },
              {
                path: "captureAttempts",
                operator: "lessThan",
                value: 5
              }
            ]
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    },
    {
      actionName: "Void",
      nextActions: [
        {
          action: "Void",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "payment.status",
                operator: "notEquals",
                value: "VOIDED"
              },
              {
                path: "voidAttempts",
                operator: "lessThan",
                value: 5
              }
            ]
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    },
    {
      actionName: "Refund",
      nextActions: [
        {
          action: "Refund",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "refund.status",
                operator: "equals",
                value: "REFUND_FAILED"
              },
              {
                path: "refundAttempts",
                operator: "lessThan",
                value: 5
              }
            ]
          }
        },
        {
          action: "Terminate",
          conditions: null
        }
      ]
    }
  ]
}; 
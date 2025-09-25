import { WorkflowDefinition } from './types/workflow.types';

export const DEFAULT_WORKFLOW: WorkflowDefinition = {
  actions: [

    // InitiatePayment action
    {
      actionName: "InitiatePayment",
      nextActions: [
        {
          action: "FraudScore",
          conditions: {
            path: "fraud.requirePreAuthentication",
            operator: "equals",
            value: true
          }
        },
        {
          action: "Authenticate",
          conditions: {
            path: "authentication.skip",
            operator: "equals",
            value: true
          }
        },
        {
          action: "Authorize",
          conditions: null // No conditions means always true
        }
      ]
    },

    // FraudScore action
    {
      actionName: "FraudScore",
      nextActions: [
        {
          action: "Authenticate",
          conditions: {
            operator: "AND",
            conditions: [
              {
                operator: "OR",
                conditions: [
                  {
                    path: "fraud.advice",
                    operator: "equals",
                    value: "CHALLENGE"
                  },
                  {
                    operator: "AND",
                    conditions: [
                      {
                        path: "fraud.advice",
                        operator: "equals",
                        value: "APPROVE"
                      },
                      {
                        path: "authentication.skip",
                        operator: "equals",
                        value: false
                      }
                    ]
                  }
                ]
              },
              {
                path: "authentication.done",
                operator: "equals",
                value: false
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
                operator: "OR",
                conditions: [
                  {
                    path: "authentication.skip",
                    operator: "equals",
                    value: true
                  },
                  {
                    path: "authentication.done",
                    operator: "equals",
                    value: true
                  }
                ],
              },
              {
                path: "fraud.advice",
                operator: "in",
                value: ["APPROVE", "CHALLENGE"]
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
                value: ["APPROVE", "CHALLENGE"]
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

    // Authenticate action
    {
      actionName: "Authenticate",
      nextActions: [
        {
          action: "FraudScore",
          conditions: {
            operator: "AND",
            conditions: [
              {
                path: "fraud.requirePreAuthorization",
                operator: "equals",
                value: true
              },
              {
                path: "authentication.done",
                operator: "equals",
                value: true
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
                path: "fraud.requirePreAuthorization",
                operator: "equals",
                value: false
              },
              {
                path: "authentication.done",
                operator: "equals",
                value: true
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

    // Authorize action
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
                value: "config.maxAuthorizeAttempts"
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
                path: "fraud.requirePostAuthorization",
                operator: "equals",
                value: true
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

    // Capture action
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
                value: "config.maxCaptureAttempts"
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

    // Void action
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
                value: "config.maxVoidAttempts"
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

    // Refund action
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
                value: "config.maxRefundAttempts"
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

    // ConfirmPayment action
    {
      actionName: "ConfirmPayment",
      nextActions: [
        {
          action: "Authorize",
          conditions: null
        }
      ]
    }
  ]
}; 
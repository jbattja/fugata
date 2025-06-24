import { ConditionEvaluator, PaymentContext, Condition, PropertyCondition, ConditionGroup, ConditionOperator } from './types/workflow.types';

export class WorkflowConditionEvaluator implements ConditionEvaluator {
  evaluate(condition: Condition, context: PaymentContext): boolean {
    if (!condition) {
      return true; // No condition means always true
    }

    // Handle array of conditions (treated as AND)
    if (Array.isArray(condition)) {
      return condition.every(cond => this.evaluate(cond, context));
    }

    // Handle different condition types
    if (this.isPropertyCondition(condition)) {
      return this.evaluatePropertyCondition(condition, context);
    }

    if (this.isConditionGroup(condition)) {
      return this.evaluateConditionGroup(condition, context);
    }

    return false;
  }

  private isPropertyCondition(condition: any): condition is PropertyCondition {
    return condition && typeof condition === 'object' && 'path' in condition && 'operator' in condition;
  }

  private isConditionGroup(condition: any): condition is ConditionGroup {
    return condition && typeof condition === 'object' && 'operator' in condition && 'conditions' in condition;
  }

  private evaluatePropertyCondition(condition: PropertyCondition, context: PaymentContext): boolean {
    const value = this.getNestedValue(context, condition.path);
    return this.compareValues(value, condition.operator, condition.value);
  }

  private evaluateConditionGroup(condition: ConditionGroup, context: PaymentContext): boolean {
    const results = condition.conditions.map(cond => this.evaluate(cond, context));
    
    if (condition.operator === 'AND') {
      return results.every(result => result);
    } else if (condition.operator === 'OR') {
      return results.some(result => result);
    }
    
    return false;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      // Return undefined if current is null/undefined or if the key doesn't exist
      return current != null && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private compareValues(actual: any, operator: ConditionOperator, expected: any): boolean {
    // Handle undefined/null values explicitly
    const isActualDefined = actual !== undefined && actual !== null;
    const isExpectedDefined = expected !== undefined && expected !== null;

    switch (operator) {
      case 'equals':
        // If actual is undefined/null, only return true if expected is also undefined/null
        if (!isActualDefined) {
          return !isExpectedDefined;
        }
        return actual === expected;
      
      case 'notEquals':
        // If actual is undefined/null, return true if expected is defined and not null
        if (!isActualDefined) {
          return isExpectedDefined;
        }
        return actual !== expected;
      
      case 'in':
        // If actual is undefined/null, return false (undefined is not in any array)
        if (!isActualDefined) {
          return false;
        }
        return Array.isArray(expected) && expected.includes(actual);
      
      case 'notIn':
        // If actual is undefined/null, return true (undefined is not in any array)
        if (!isActualDefined) {
          return true;
        }
        return Array.isArray(expected) && !expected.includes(actual);
      
      case 'greaterThan':
        if (!isActualDefined || !isExpectedDefined) {
          return false;
        }
        return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      
      case 'lessThan':
        if (!isActualDefined || !isExpectedDefined) {
          return false;
        }
        return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      
      case 'greaterThanOrEqual':
        if (!isActualDefined || !isExpectedDefined) {
          return false;
        }
        return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
      
      case 'lessThanOrEqual':
        if (!isActualDefined || !isExpectedDefined) {
          return false;
        }
        return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
      
      case 'exists':
        return isActualDefined;
      
      case 'notExists':
        return !isActualDefined;
      
      default:
        return false;
    }
  }
} 
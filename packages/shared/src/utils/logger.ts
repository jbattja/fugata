/* eslint-disable no-console */
/**
 * Cross-platform logger that works in both Next.js and NestJS environments
 * 
 * Environment Variables:
 * - FUGATA_LOGGER=nestjs|console|none
 * - Default: 'console' (safe fallback)
 */
export class SharedLogger {
  private static getLoggerType(): 'nestjs' | 'console' | 'none' {
    const loggerType = process.env.FUGATA_LOGGER;
    
    if (loggerType === 'nestjs' || loggerType === 'console' || loggerType === 'none') {
      return loggerType;
    }
    
    // Default to console for safety
    return 'none';
  }

  static log(message: string, context?: string): void {
    const loggerType = this.getLoggerType();
    
    if (loggerType === 'none') {
      return; // No logging
    }
    
    if (loggerType === 'nestjs') {
      try {
        const { Logger } = require('@nestjs/common');
        Logger.log(message, context);
      } catch {
        // Fallback to console if NestJS Logger is not available
        console.log(`[${context || 'SharedLogger'}] ${message}`);
      }
    } else {
      // console logger type
      console.log(`[${context || 'SharedLogger'}] ${message}`);
    }
  }

  static warn(message: string, context?: string): void {
    const loggerType = this.getLoggerType();
    
    if (loggerType === 'none') {
      return;
    }
    
    if (loggerType === 'nestjs') {
      try {
        const { Logger } = require('@nestjs/common');
        Logger.warn(message, context);
      } catch {
        console.warn(`[${context || 'SharedLogger'}] ${message}`);
      }
    } else {
      console.warn(`[${context || 'SharedLogger'}] ${message}`);
    }
  }

  static error(message: string, context?: string, error?: any): void {
    const loggerType = this.getLoggerType();
    
    if (loggerType === 'none') {
      return;
    }
    
    if (loggerType === 'nestjs') {
      try {
        const { Logger } = require('@nestjs/common');
        Logger.error(message, error?.stack || error, context);
      } catch {
        console.error(`[${context || 'SharedLogger'}] ${message}`, error);
      }
    } else {
      console.error(`[${context || 'SharedLogger'}] ${message}`, error);
    }
  }
} 
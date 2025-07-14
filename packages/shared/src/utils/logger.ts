/* eslint-disable no-console */
/**
 * Cross-platform logger that works in both Next.js and NestJS environments
 * 
 */
export class SharedLogger {

  private static isServerSide(): boolean {
    // Check if we're in a Node.js environment (server-side)
    return typeof window === 'undefined' || typeof process !== 'undefined';
  }

  static log(message: string, data?: any, context?: string,): void {
    if (!this.isServerSide()) {
      // don't log in the browser
      return;
    }
    try {
      const { Logger } = require('@nestjs/common');
      if (data) {
        Logger.log(message, data, context);
      } else {
        Logger.log(message, context);
      }
    } catch {
      // Fallback to console if NestJS Logger is not available
      if (data) {
        console.log(`[${context || 'SharedLogger'}] ${message}`, data);
      } else {
        console.log(`[${context || 'SharedLogger'}] ${message}`);
      }
    }
  }

  static warn(message: string, data?: any, context?: string): void {
    if (!this.isServerSide()) {
      // don't log in the browser
      return;
    }
    try {
      const { Logger } = require('@nestjs/common');
      if (data) {
        Logger.warn(message, data, context);
      } else {
        Logger.warn(message, context);
      }
    } catch {
      // Fallback to console if NestJS Logger is not available
      if (data) {
        console.warn(`[${context || 'SharedLogger'}] ${message}`, data);
      } else {
        console.warn(`[${context || 'SharedLogger'}] ${message}`);
      }
    }
  }

  static error(message: string, context?: string, error?: any): void {
    if (!this.isServerSide()) {
      // don't log in the browser
      return;
    }
    try {
      const { Logger } = require('@nestjs/common');
      if (error && error.response && error.response.data) {
        Logger.error(`${message}`, error.response.data, context);
      } else if (error && error.message) {
        Logger.error(`${message}`, error.message, context);
      } else {
        Logger.error(`${message}`, context);
      }
      } catch {
      // Fallback to console if NestJS Logger is not available
      if (error) {
        console.error(`[${context || 'SharedLogger'}] ${message}`, error);
      } else {
        console.error(`[${context || 'SharedLogger'}] ${message}`);
      }
    }
  }
} 
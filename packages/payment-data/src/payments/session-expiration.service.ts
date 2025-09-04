import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentSessionsService } from './payment-sessions.service';
import { SharedLogger } from '@fugata/shared';

@Injectable()
export class SessionExpirationService {

  constructor(
    private readonly paymentSessionsService: PaymentSessionsService
  ) {}

  /**
   * Runs every 5 minutes to check for expired sessions
   * This is a good balance between responsiveness and performance
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleSessionExpiration(): Promise<void> {
    try {
      
      const expiredCount = await this.paymentSessionsService.expireSessions();
      
      if (expiredCount > 0) {
        SharedLogger.log(`Session expiration job completed: ${expiredCount} sessions expired`, undefined, SessionExpirationService.name);
      }
    } catch (error) {
      SharedLogger.error('Session expiration job failed:', error as any, SessionExpirationService.name);
    }
  }

  /**
   * Manual trigger for session expiration (useful for testing or immediate cleanup)
   */
  async triggerExpiration(): Promise<number> {
    return await this.paymentSessionsService.expireSessions();
  }

  /**
   * Health check method to verify the service is working
   */
  async healthCheck(): Promise<{ status: string; lastRun?: Date; nextRun?: Date }> {
    return {
      status: 'healthy',
      // Note: NestJS scheduler doesn't expose last/next run times directly
      // This could be enhanced with custom tracking if needed
    };
  }
}

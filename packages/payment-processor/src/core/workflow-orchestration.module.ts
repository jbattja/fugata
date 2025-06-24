import { Module, Global } from '@nestjs/common';
import { WorkflowOrchestrationService } from './workflow-orchestration.service';

@Global()
@Module({
  providers: [WorkflowOrchestrationService],
  exports: [WorkflowOrchestrationService],
})
export class WorkflowOrchestrationModule {} 
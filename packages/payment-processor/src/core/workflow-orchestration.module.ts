import { Module, Global } from '@nestjs/common';
import { WorkflowOrchestrationService } from './workflow-orchestration.service';
import { KafkaModule } from '../kafka/kafka.module';

@Global()
@Module({
  imports: [KafkaModule],
  providers: [WorkflowOrchestrationService],
  exports: [WorkflowOrchestrationService],
})
export class WorkflowOrchestrationModule {} 
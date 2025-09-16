import { Injectable } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationEntity } from '../entities/operation.entity';
import { Operation, OperationType, OperationStatus } from '@fugata/shared';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly operationRepository: Repository<OperationEntity>
  ) {}

  async storeOperation(operation: Operation): Promise<void> {
    // Check if operation already exists
    const existingOperation = await this.getOperationById(operation.operationId);
    
    if (!existingOperation) {
      // Create new operation
      await this.createOperation(operation);
    } else {
      // Update existing operation
      await this.updateOperation(operation.operationId, operation);
    }
  }

  async createOperation(operation: Operation): Promise<void> {
    const entity = this.operationRepository.create({
      operationId: operation.operationId,
      operationType: operation.operationType,
      paymentId: operation.paymentId,
      amount: operation.amount,
      reference: operation.reference,
      status: operation.status,
      refusalReason: operation.refusalReason,
      createdAt: operation.createdAt || new Date(),
      updatedAt: operation.updatedAt || new Date()
    });

    await this.operationRepository.save(entity);
    SharedLogger.log(`Created operation: ${operation.operationType} with ID ${operation.operationId} for payment ${operation.paymentId}`, undefined, OperationsService.name);
  }

  async updateOperation(operationId: string, operation: Operation): Promise<void> {
    const updateData: any = {
      operationType: operation.operationType,
      paymentId: operation.paymentId,
      amount: operation.amount,
      reference: operation.reference,
      status: operation.status,
      refusalReason: operation.refusalReason,
      updatedAt: operation.updatedAt || new Date()
    };
    
    await this.operationRepository.update(
      { operationId },
      updateData
    );
    SharedLogger.log(`Updated operation: ${operation.operationType} with ID ${operationId} for payment ${operation.paymentId}`, undefined, OperationsService.name);
  }

  async getOperationsForPayment(paymentId: string, operationType?: OperationType): Promise<Operation[]> {
    const query = this.operationRepository
      .createQueryBuilder('operation')
      .where('operation.paymentId = :paymentId', { paymentId })
      .orderBy('operation.createdAt', 'ASC');

    if (operationType) {
      query.andWhere('operation.operationType = :operationType', { operationType });
    }

    const entities = await query.getMany();
    return entities.map(entity => this.entityToOperation(entity));
  }

  async getOperationById(operationId: string): Promise<Operation | null> {
    const entity = await this.operationRepository.findOne({
      where: { operationId }
    });

    return entity ? this.entityToOperation(entity) : null;
  }

  async updateOperationStatus(operationId: string, status: OperationStatus, refusalReason?: string): Promise<void> {
    await this.operationRepository.update(
      { operationId },
      { 
        status, 
        refusalReason,
        updatedAt: new Date()
      }
    );
    SharedLogger.log(`Updated operation ${operationId} status to ${status}`, undefined, OperationsService.name);
  }

  private entityToOperation(entity: OperationEntity): Operation {
    const operation: any = {
      operationId: entity.operationId,
      operationType: entity.operationType,
      paymentId: entity.paymentId,
      amount: entity.amount,
      reference: entity.reference,
      status: entity.status,
      refusalReason: entity.refusalReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };

    return operation;
  }
}

import { getMerchant, Payment, PaymentStatus, RequirePermissions, validatePaymentInstrument } from "@fugata/shared";
import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { v4 as uuidv4 } from 'uuid';
import { WorkflowOrchestrationService } from "src/core/workflow-orchestration.service";
import { ValidationException } from "src/exceptions/validation.exception";

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly workflowOrchestrationService: WorkflowOrchestrationService,
  ) {}

  @Post()
  @RequirePermissions('payments:write')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: Payment })
  async createPayment(@Body() paymentData: CreatePaymentDto, @Req() request: any): Promise<Payment> {
    const merchant = getMerchant(request);
    this.logger.log(`Creating payment for merchant: ${merchant.id}`);

    
    const paymentId = uuidv4();
    const payment = new Payment({
      paymentId: paymentId,
      status: PaymentStatus.INITIATED,
      createdAt: new Date(),
      updatedAt: new Date(),
      merchant: {
        id: merchant.id,
        accountCode: merchant.accountCode
      },
    });    
    // Merge provided data
    Object.assign(payment, paymentData);
    try {
    validatePaymentInstrument(paymentData.paymentInstrument, payment);
    } catch (error) {
      throw new ValidationException(error.message);
    }
    const workflowResult = await this.workflowOrchestrationService.executePayment(payment, request);
    return workflowResult.context.payment;
  }
}
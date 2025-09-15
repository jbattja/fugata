import { FugataReference, getMerchant, Payment, PaymentStatus, RequirePermissions, validatePaymentInstrument, Capture } from "@fugata/shared";
import { Body, Controller, Post, Req, UnauthorizedException, Param } from "@nestjs/common";
import { SharedLogger } from '@fugata/shared';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { CreateCaptureDto } from "./dto/create-capture.dto";
import { WorkflowOrchestrationService } from "src/core/workflow-orchestration.service";
import { ValidationException } from "src/exceptions/validation.exception";

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {

  constructor(
    private readonly workflowOrchestrationService: WorkflowOrchestrationService,
  ) { }

  @Post()
  @RequirePermissions('payments:write')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: Payment })
  async createPayment(@Body() paymentData: CreatePaymentDto, @Req() request: any): Promise<Payment> {
    SharedLogger.log(`Creating payment`, undefined, PaymentsController.name);
    const merchant = getMerchant(request);
    if (!merchant) {
      throw new UnauthorizedException('Merchant not found');
    }
    const sessionId = request.headers['x-session-id'];
    SharedLogger.log(`Creating payment for merchant: ${merchant.id}${sessionId ? ` with session: ${sessionId}` : ''}`, undefined, PaymentsController.name);

    const paymentId = FugataReference.generateReference();
    const payment = new Payment({
      paymentId: paymentId,
      status: PaymentStatus.INITIATED,
      createdAt: new Date(),
      updatedAt: new Date(),
      merchant: {
        id: merchant.id,
        accountCode: merchant.accountCode
      },
      sessionId: sessionId
    });
    // Merge provided data
    Object.assign(payment, paymentData);
    try {
      validatePaymentInstrument(paymentData.paymentInstrument, payment);
    } catch (error) {
      throw new ValidationException(error.message);
    }
    const workflowResult = await this.workflowOrchestrationService.executePayment(payment, request, sessionId);
    return workflowResult.context.payment;
  }

  @Post(':id/capture')
  @RequirePermissions('payments:write')
  @ApiOperation({ summary: 'Create a capture for an existing payment' })
  @ApiResponse({ status: 201, description: 'Capture created successfully', type: Capture })
  async createCapture(
    @Param('id') paymentId: string,
    @Body() captureData: CreateCaptureDto,
    @Req() request: any
  ): Promise<Capture> {
    SharedLogger.log(`Creating capture for payment: ${paymentId}`, undefined, PaymentsController.name);
    
    const merchant = getMerchant(request);
    if (!merchant) {
      throw new UnauthorizedException('Merchant not found');
    }
    const capture = new Capture({
      captureId: FugataReference.generateReference(),
      paymentId: paymentId,
      amount: captureData.amount,
      captureReference: captureData.captureReference,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const workflowResult = await this.workflowOrchestrationService.executeCapture(paymentId, capture, request, captureData.finalCapture);
    return workflowResult.context.capture;
  }
}
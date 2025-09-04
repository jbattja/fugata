import axios, { AxiosInstance } from "axios";
import { Payment } from "../types/payment/payment";
import { PaymentSession } from "../types/payment/payment-session";
import { RecurringUsage, PaymentFlow, CaptureMethod } from "../types/payment/payment-common";
import { PaymentInstrument } from "../types/payment/payment-instrument";
import { SharedLogger } from "../utils/logger";

export class PaymentProcessorClient {
  private readonly httpClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl
    });
  }

  async createPayment(headers: Record<string, string>, paymentData: Partial<Payment>): Promise<Payment> {
    const requestHeaders = { ...headers };
    if (paymentData.sessionId) {
      requestHeaders['x-session-id'] = paymentData.sessionId;
    }
    SharedLogger.log(`Creating payment for merchant: ${paymentData.merchant?.id}`, undefined, PaymentProcessorClient.name);
    const response = await this.httpClient.post('payments', paymentData, {
      headers: requestHeaders
    });
    SharedLogger.log(`Payment created for merchant: ${paymentData.merchant?.id}`, undefined, PaymentProcessorClient.name);
    return response.data;
  }

  /**
   * Creates a Payment object from a PaymentSession
   * This method handles the conversion from session data to payment data
   */
  createPaymentFromSession(session: PaymentSession, paymentInstrument?: PaymentInstrument): Partial<Payment> {
    return new Payment({
      amount: session.amount,
      reference: session.reference,
      customer: session.customer,
      paymentType: session.paymentType || {
        recurringUsage: RecurringUsage.NONE,
        paymentFlow: PaymentFlow.PAY
      },
      captureMethod: session.captureMethod || CaptureMethod.AUTOMATIC,
      returnUrl: session.returnUrl,
      orderLines: session.orderLines,
      merchant: session.merchant,
      metadata: session.metadata,
      sessionId: session.sessionId,
      // Add payment instrument if provided
      paymentInstrument: paymentInstrument
    });
  }
}

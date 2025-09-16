import { Refund, OperationStatus } from "@fugata/shared";
import { RefundPaymentRequestDto } from "src/partner-communication/dto/refund-payment-request.dto";

export class DemoPartnerRefund {

    static refund(request: RefundPaymentRequestDto): Refund {
        if (request.payment.customer?.customerName) {
            switch (request.payment.customer.customerName.toLowerCase()) {
                case 'refused':
                    request.refund.status = OperationStatus.FAILED;
                    request.refund.refusalReason = "Refund refused by partner";
                    break;
                case 'refund failed':
                    request.refund.status = OperationStatus.FAILED;
                    request.refund.refusalReason = "Refund processing failed";
                    break;
                default:
                    request.refund.status = OperationStatus.SUCCEEDED;
            }
        } else {
            request.refund.status = OperationStatus.SUCCEEDED;
        }
        return request.refund;
    }
}

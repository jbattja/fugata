import { Void, OperationStatus } from "@fugata/shared";
import { VoidPaymentRequestDto } from "src/partner-communication/dto/void-payment-request.dto";

export class DemoPartnerVoid {

    static void(request: VoidPaymentRequestDto): Void {
        if (request.payment.customer?.customerName) {
            switch (request.payment.customer.customerName.toLowerCase()) {
                case 'refused':
                    request.voidOperation.status = OperationStatus.FAILED;
                    request.voidOperation.refusalReason = "Void refused by partner";
                    break;
                case 'void failed':
                    request.voidOperation.status = OperationStatus.FAILED;
                    request.voidOperation.refusalReason = "Void processing failed";
                    break;
                default:
                    request.voidOperation.status = OperationStatus.SUCCEEDED;
            }
        } else {
            request.voidOperation.status = OperationStatus.SUCCEEDED;
        }
        return request.voidOperation;
    }
}

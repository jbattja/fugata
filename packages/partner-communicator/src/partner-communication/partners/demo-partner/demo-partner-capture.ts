import { Capture, CaptureStatus } from "@fugata/shared";
import { CapturePaymentRequestDto } from "src/partner-communication/dto/capture-payment-request.dto";

export class DemoPartnerCapture {

    static capture(request: CapturePaymentRequestDto): Capture {
        if (request.payment.customer?.customerName) {
            switch (request.payment.customer.customerName.toLowerCase()) {
                case 'refused':
                    request.capture.status = CaptureStatus.FAILED;
                    break;
                case 'capture failed':
                    request.capture.status = CaptureStatus.FAILED;
                    break;
                default:
                    request.capture.status = CaptureStatus.SUCCEEDED;
            }
        }
        return request.capture;
    }
}
import { PaymentDataClient, PaymentProcessorClient } from '@fugata/shared';

// Create a singleton instance of the clients
const paymentDataClient = new PaymentDataClient(process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3001');
const paymentProcessorClient = new PaymentProcessorClient(process.env.PAYMENT_PROCESSOR_SERVICE_URL || 'http://localhost:3002');

export { paymentDataClient, paymentProcessorClient }; 
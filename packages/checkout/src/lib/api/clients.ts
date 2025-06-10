import { PaymentDataClient, SettingsClient } from '@fugata/shared';

// Create a singleton instance of the clients
const paymentDataClient = new PaymentDataClient(process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3002');

export { paymentDataClient }; 
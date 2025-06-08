import { PaymentDataClient, SettingsClient } from '@fugata/shared';

// Create a singleton instance of the clients
const settingsClient = new SettingsClient(process.env.SETTINGS_SERVICE_URL || 'http://localhost:3000');
const paymentDataClient = new PaymentDataClient(process.env.PAYMENT_DATA_SERVICE_URL || 'http://localhost:3001');

export { settingsClient,paymentDataClient }; 
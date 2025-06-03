import { validate } from 'class-validator';
import { AdyenSettings } from './adyen-settings';
import { StripeSettings } from './stripe-settings';
import { Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export * from './adyen-settings';
export * from './stripe-settings';

const logger = new Logger('IntegrationSettings');

export interface IntegrationSettings {
    providerCode: string;
}

export async function validateSettingsForProvider(providerCode: string, settings: Record<string, any>): Promise<ValidationError[]> {
    // Get all integration settings classes
    const integrationSettingsClasses = [AdyenSettings, StripeSettings];
    
    // Find the matching integration settings class
    const matchingClass = integrationSettingsClasses.find(cls => new cls().providerCode === providerCode);
    if (!matchingClass) {
        // nothing to validate against, so no errors
        logger.log(`No matching integration settings class found for provider code: ${providerCode}`);
        return [] as ValidationError[];
    }

    // Create an instance of the matching class and assign the settings
    const instance = new matchingClass();
    Object.assign(instance, settings);

    // Validate the instance
    const errors = await validate(instance);
    return errors;
}


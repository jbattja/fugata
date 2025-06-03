import { IsNotEmpty } from "class-validator";

import { IsString } from "class-validator";
import { IntegrationSettings } from "./integration-settings";

export class StripeSettings implements IntegrationSettings {
    providerCode: string = 'stripe';

    @IsString()
    @IsNotEmpty()
    secretKey: string;
}

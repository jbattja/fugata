import { IsNotEmpty } from "class-validator";

import { IsString } from "class-validator";
import { IntegrationSettings } from "./integration-settings";

export class AdyenSettings implements IntegrationSettings {
    providerCode: string = 'adyen';

    @IsString()
    @IsNotEmpty()
    merchantAccount: string;

    @IsString()
    @IsNotEmpty()
    apiKey: string;
}

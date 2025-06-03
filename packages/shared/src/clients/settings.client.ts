import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ProviderCredential } from '../types/settings/settings';

@Injectable()
export class SettingsClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string
  ) {}

  async getProviderCredentialForMerchant(merchantCode: string, conditions: Record<string, any>): Promise<ProviderCredential> {
    const response = await firstValueFrom(
      this.httpService.get<ProviderCredential>(`${this.baseUrl}/settings/get-credentials?merchantCode=${merchantCode}`)
    );
    return response.data;
  }

} 
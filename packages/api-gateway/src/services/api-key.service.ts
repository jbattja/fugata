import axios from 'axios'
import * as crypto from 'crypto'
import { ApiKey } from '../types'
import { SharedLogger } from '@fugata/shared';
import { jwtService } from '../lib/jwt.service'

interface SettingsApiCredential {
  id: string
  name: string
  created: string
  status: 'ACTIVE' | 'INACTIVE'
  allowedIpRange: string[] | null
  apiKeys: Array<{
    apiHash: string
    expiryDate: string | null
  }>
  merchant: {
    id: string
    accountCode: string
  }
  updatedAt: string
}

export class ApiKeyService {
  private settingsServiceUrl: string
  private apiKeysCache: Map<string, ApiKey> = new Map()
  private lastCacheUpdate: number = 0
  private readonly cacheTtl = 5 * 60 * 1000 // 5 minutes

  constructor(settingsServiceUrl: string) {
    this.settingsServiceUrl = settingsServiceUrl
  }

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex')
  }

  private async fetchApiCredentials(): Promise<SettingsApiCredential[]> {
    try {
      const response = await axios.get(`${this.settingsServiceUrl}/api-credentials`, { headers: jwtService.getAuthHeadersForServiceAccount() })
      return response.data
    } catch (error) {
      SharedLogger.error('Failed to fetch API credentials from settings service:', error as any, ApiKeyService.name);
      throw new Error('Failed to fetch API credentials')
    }
  }

  private transformToApiKey(credential: SettingsApiCredential, apiHash: string): ApiKey {
    return {
      key: apiHash, // We'll use the hash as the key for lookup
      merchant: credential.merchant ? {
        id: credential.merchant.id,
        accountCode: credential.merchant.accountCode
      } : null,
      permissions: ['payments:read', 'payments:write', 'settings:read', 'settings:write'], // Default permissions for now
      rateLimit: {
        requests: 100,
        interval: 60 // 60 seconds
      }
    }
  }

  private async updateCache(): Promise<void> {
    const now = Date.now()
    if (now - this.lastCacheUpdate < this.cacheTtl) {
      return // Cache is still fresh
    }

    try {
      const credentials = await this.fetchApiCredentials()
      this.apiKeysCache.clear()

      for (const credential of credentials) {
        if (credential.status !== 'ACTIVE') {
          continue // Skip inactive credentials
        }

        for (const apiKey of credential.apiKeys) {
          // Check if API key has expired
          if (apiKey.expiryDate && new Date(apiKey.expiryDate) < new Date()) {
            continue // Skip expired API keys
          }

          const transformedApiKey = this.transformToApiKey(credential, apiKey.apiHash)
          this.apiKeysCache.set(apiKey.apiHash, transformedApiKey)
        }
      }

      this.lastCacheUpdate = now
      SharedLogger.log(`Updated API key cache with ${this.apiKeysCache.size} active keys`, undefined, ApiKeyService.name);
    } catch (error) {
      SharedLogger.error('Failed to update API key cache:', error as any, ApiKeyService.name);
      // Don't throw here, we'll continue with existing cache
    }
  }

  async findApiKey(apiKey: string): Promise<ApiKey | null> {
    await this.updateCache()
    
    const apiHash = this.hashApiKey(apiKey)
    return this.apiKeysCache.get(apiHash) || null
  }

  async refreshCache(): Promise<void> {
    this.lastCacheUpdate = 0 // Force cache refresh
    await this.updateCache()
  }

  getCacheStats(): { size: number; lastUpdate: number } {
    return {
      size: this.apiKeysCache.size,
      lastUpdate: this.lastCacheUpdate
    }
  }
} 
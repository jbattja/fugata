import { Injectable } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { request } from 'undici';
import { ServiceName } from '../types';
import { JwtService } from './jwt.service';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class ProxyService {
  constructor(
    private paymentProcessorUrl: string,
    private paymentDataUrl: string,
    private jwtService: JwtService
  ) {}

  private getServiceUrl(service: ServiceName): string {
    switch (service) {
      case 'payment-processor':
        return this.paymentProcessorUrl
      case 'payment-data':
        return this.paymentDataUrl
      default:
        throw new Error(`Unknown service: ${service}`)
    }
  }

  private buildTargetPath(targetPath: string, req: FastifyRequest): string {
    let finalPath = targetPath;
    
    // Replace path parameters (e.g., :id) with actual values from the request
    const pathParams = req.params as Record<string, string>;
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, value);
      });
    }

    // Add query parameters if present
    const queryParams = req.query as Record<string, string>;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
      finalPath += `?${queryString}`;
    }

    return finalPath;
  }

  async proxyRequest(
    service: ServiceName,
    targetPath: string,
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const targetUrl = this.getServiceUrl(service);
    const finalTargetPath = this.buildTargetPath(targetPath, req);
    const url = new URL(finalTargetPath, targetUrl);

    try {
      // Generate service token for internal communication
      const authenticatedRequest = req as AuthenticatedRequest;
      const apiKey = authenticatedRequest.apiKey;
      
      if (!apiKey) {
        throw new Error('API key not found in authenticated request');
      }

      const serviceToken = this.jwtService.generateServiceToken(
        apiKey.clientId, // merchantId
        apiKey.permissions,
        service
      );

      const headers = {
        ...this.filterHeaders(req.headers),
        'Authorization': `Bearer ${serviceToken}`,
        'X-Merchant-ID': apiKey.clientId,
        'X-Service-Token': 'true'
      };

      const response = await request(url, {
        method: req.method as any,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      let responseBody;
      const contentType = response.headers['content-type'];
      if (contentType?.includes('application/json')) {
        responseBody = await response.body.json();
      } else {
        responseBody = await response.body.text();
      }

      // Forward the status code and response
      reply
        .status(response.statusCode)
        .headers(response.headers as Record<string, string>)
        .send(responseBody);
    } catch (error) {
      req.log.error('Proxy request failed:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        service,
        url: url.toString(),
        originalPath: req.url,
        targetPath,
        finalTargetPath
      });

      reply.status(502).send({
        code: 'PROXY_ERROR',
        message: 'Failed to proxy request to internal service',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private filterHeaders(headers: Record<string, any>): Record<string, any> {
    const allowedHeaders = ['content-type', 'accept', 'idempotency-key'];
    return Object.fromEntries(
      Object.entries(headers).filter(([key]) => allowedHeaders.includes(key.toLowerCase()))
    );
  }
} 
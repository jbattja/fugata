import { Injectable } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { request } from 'undici';
import { ServiceName } from '../types';

@Injectable()
export class ProxyService {
  constructor(
    private paymentProcessorUrl: string,
    private paymentDataUrl: string
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

  async proxyRequest(
    service: ServiceName,
    targetPath: string,
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const targetUrl = this.getServiceUrl(service);
    const url = new URL(targetPath, targetUrl);

    try {

      const response = await request(url, {
        method: req.method,
        headers: this.filterHeaders(req.headers),
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
        url: url.toString()
      });

      reply.status(502).send({
        code: 'PROXY_ERROR',
        message: 'Failed to proxy request to internal service',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private filterHeaders(headers: Record<string, any>): Record<string, any> {
    const allowedHeaders = ['authorization', 'content-type', 'accept', 'idempotency-key'];
    return Object.fromEntries(
      Object.entries(headers).filter(([key]) => allowedHeaders.includes(key.toLowerCase()))
    );
  }
} 
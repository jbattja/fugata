import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class UnsupportedOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransformerError';
  }
 }

@Catch(UnsupportedOperationError)
export class UnsupportedOperationErrorFilter implements ExceptionFilter {
  catch(exception: UnsupportedOperationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_IMPLEMENTED).json({
      statusCode: HttpStatus.NOT_IMPLEMENTED,
      message: [exception.message],
      error: 'Unsupported Operation',
    });
    return;
  }
} 
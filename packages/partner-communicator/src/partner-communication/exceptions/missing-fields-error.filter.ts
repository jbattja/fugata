import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class MissingFieldsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransformerError';
  }
 }

@Catch(MissingFieldsError)
export class MissingFieldsErrorFilter implements ExceptionFilter {
  catch(exception: MissingFieldsError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: [exception.message],
      error: 'Bad Request',
    });
    return;
  }
} 
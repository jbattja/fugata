import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TranformerError } from 'src/payment/routing/transformer';

interface PostgresError {
  code: string;
  detail: string;
}

@Catch(TranformerError)
export class TransformerErrorFilter implements ExceptionFilter {
  catch(exception: TranformerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: [exception.message],
      error: 'Bad Request',
    });
    return;
  }
} 
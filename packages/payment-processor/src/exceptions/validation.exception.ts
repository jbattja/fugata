import { HttpException, HttpStatus } from '@nestjs/common';

export interface ValidationError {
  message: string;
}

export class ValidationException extends HttpException {
  constructor(message: string = 'Validation failed') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST
    );
  }
} 
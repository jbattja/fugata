import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from 'src/exceptions/validation.exception';

@Catch(ValidationException)
export class ValidationErrorFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: exception.message,
            error: 'Bad Request',
        });
        return;
    }
} 
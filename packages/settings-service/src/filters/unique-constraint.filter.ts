import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

interface PostgresError {
  code: string;
  detail: string;
}

@Catch(QueryFailedError)
export class UniqueConstraintFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check if this is a unique constraint violation (PostgreSQL error code 23505)
    const driverError = exception.driverError as unknown as PostgresError;
    if (driverError?.code === '23505') {
      // Extract the column name and value from the detail field
      const detail = driverError.detail;
      if (detail) {
        const match = detail.match(/Key \((.*?)\)=\((.*?)\) already exists/);
        if (match) {
          const [, columnName, value] = match;
          
          // Format the column name for the error message
          const formattedColumnName = columnName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [`${formattedColumnName} '${value}' already exists`],
            error: 'Bad Request',
          });
          return;
        }
      }
    }
    
    // If we couldn't parse the error or it's not a unique constraint error, let it propagate
    throw exception;
  }
} 
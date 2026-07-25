import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from './base.exception';
import { ERROR_CODES } from './error-codes.enum';

/**
 * Global exception filter that catches all unhandled exceptions across the application.
 * Formats error responses consistently and logs the error details using Winston.
 * Handles custom BaseExceptions, standard HttpExceptions, and generic Errors.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_CODES.INTERNAL_SERVER_ERROR.defaultMessage;
    let errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR.code;
    let details: any = null;

    if (exception instanceof BaseException) {
      statusCode = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      
      const responseData = exception.getResponse() as any;
      
      if (typeof responseData === 'object' && responseData.message) {
          // Handle built-in ValidationPipe errors
          if (Array.isArray(responseData.message)) {
              errorCode = ERROR_CODES.VALIDATION_ERROR.code;
              message = ERROR_CODES.VALIDATION_ERROR.defaultMessage;
              details = responseData.message;
          } else {
              message = responseData.message;
              errorCode = responseData.error ? responseData.error.toUpperCase().replace(/\s+/g, '_') : ERROR_CODES.BAD_REQUEST.code;
          }
      }
    } else if (exception instanceof Error) {
        // Fallback for generic errors
        message = exception.message;
    }

    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      errorCode,
      message,
      ...(details ? { details } : {}),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - [${errorCode}] ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    response.status(statusCode).json(errorResponse);
  }
}

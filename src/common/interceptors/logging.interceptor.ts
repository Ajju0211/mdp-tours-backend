import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor that automatically logs incoming HTTP requests and their responses.
 * Tracks execution time, status codes, user agents, and client IP addresses.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(`[Request] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - now;
          this.logger.log(`[Response] ${method} ${url} - Status: ${response.statusCode} - ${delay}ms`);
        },
        error: (error) => {
           const delay = Date.now() - now;
           this.logger.log(`[Response Error] ${method} ${url} - Status: ${error?.status || 500} - ${delay}ms`);
        }
      }),
    );
  }
}

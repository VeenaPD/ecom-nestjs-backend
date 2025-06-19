import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query } = request;
    const now = Date.now(); // Timestamp for measuring response time

    // Log request details
    this.logger.log(`Incoming Request: ${method} ${url}`);
    this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    this.logger.debug(`Request Query: ${JSON.stringify(query)}`);

    return next.handle().pipe(
      tap(
        (data) => {
          // Log successful response
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          this.logger.log(`Outgoing Response: ${method} ${url} ${statusCode} - ${Date.now() - now}ms`);
          this.logger.debug(`Response Data: ${JSON.stringify(data).substring(0, 500)}...`); // Log first 500 chars
        },
        (error) => {
          // Log error response
          const response = context.switchToHttp().getResponse();
          const statusCode = error.response?.statusCode || response.statusCode || 500;
          this.logger.error(`Error Response: ${method} ${url} ${statusCode} - ${Date.now() - now}ms`);
          this.logger.error(`Error Message: ${error.message}`);
          this.logger.error(`Error Stack: ${error.stack}`);
        },
      ),
    );
  }
}
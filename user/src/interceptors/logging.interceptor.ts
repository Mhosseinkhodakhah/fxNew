import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers, path } = request;    

    if (path === '/metrics') {
        return next.handle();
    }
    
    const startTime = Date.now();

    this.logger.http('Incoming Request', {
      method,
      url,
      headers: this.sanitizeHeaders(headers),
      timestamp: new Date().toISOString(),
      fileOnly: true,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          response.on('finish', () => {
            this.logger.http('Request Completed', {
              method,
              url,
              statusCode: response.statusCode, // correct final code
              duration: `${duration}ms`,
              headers: this.sanitizeHeaders(headers),
              timestamp: new Date().toISOString(),
              fileOnly: true,
            });
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          response.on('finish', () => {
            this.logger.error('Request Failed', {
              method,
              url,
              statusCode: response.statusCode, // correct final code
              duration: `${duration}ms`,
              headers: this.sanitizeHeaders(headers),
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
              fileOnly: true, // Custom flag to indicate file-only logging
            });
          });
        },
      }),
    );


  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'set-cookie',
    ];  
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }
}

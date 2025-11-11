import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';

/**
 * Request Logger Middleware
 * Adds correlation IDs and logs all incoming requests
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Generate or use existing request ID
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Add request ID to request object for later use
    // Using type assertion to extend Request with custom property
    (req as Request & { requestId: string }).requestId = requestId;

    // Set response header
    res.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Log incoming request
    this.logger.info('Incoming request', {
      requestId,
      method,
      url: originalUrl,
      ip,
      userAgent,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      this.logger.log(logLevel, 'Request completed', {
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        ip,
      });
    });

    next();
  }
}

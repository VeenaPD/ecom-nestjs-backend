import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP'); // Context for the logger

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip; // Or req.ips for proxy awareness

    const now = Date.now(); // Start timing the request

    // Log request initiation
    this.logger.log(`--> ${method} ${originalUrl} | User-Agent: ${userAgent} | IP: ${ip}`);

    // Listen for the response 'finish' event
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - now; // Calculate duration

      // Log request completion
      this.logger.log(
        `<-- ${method} ${originalUrl} ${statusCode} ${contentLength || '-'} - ${duration}ms`
      );
    });

    next(); // Pass control to the next middleware or route handler
  }
}
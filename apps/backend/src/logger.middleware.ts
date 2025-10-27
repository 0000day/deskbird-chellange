import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const ip = req.get('X-Real-IP') || req.get('X-Forwarded-For') || req.ip;
    const userAgent = req.get('User-Agent') || '';

    res.on('close', () => {
      const { statusCode } = res;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent}`
      );
    });

    next();
  }
}
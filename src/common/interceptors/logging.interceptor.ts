import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { Request } from 'express';

interface IRequest extends Request {
  number: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<IRequest>();
    const requestJson = {
      method: request.method,
      url: request.url,
      body: request.body,
      headers: request.headers,
    };

    return next
      .handle()
      .pipe(
        tap((data: object) => {
          console.log(JSON.stringify({
            number: request.number,
            request: requestJson,
            resolved: data,
            time: getExecutionTime(startTime),
          }));
        }),
        catchError((error: Error) => {
          console.log(JSON.stringify({
            number: request.number,
            request: requestJson,
            rejected: {
              code: error instanceof HttpException ? error.getStatus() : 500,
              message: error.message,
              stack: error.stack,
            },
            time: getExecutionTime(startTime),
          }));
          throw error;
        }),
      );
  }
}

const getExecutionTime = (startTime: number): number => {
  return Date.now() - startTime;
};

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
    const response = httpContext.getResponse();

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
          // TODO: This is for prod
          console.log(JSON.stringify({
            type: 'http',
            number: request.number,
            request: requestJson,
            resolved: data,
            time: getExecutionTime(startTime),
          }));
          // TODO: This is for test
          // console.log(
          //   request.number + ' ' +
          //   request.method + ' ' +
          //   response.statusCode + ' ' +
          //   requestJson.url + ' ' +
          //   getExecutionTime(startTime),
          // );
        }),
        catchError((error: Error) => {
          // TODO: This is for prod
          console.log(JSON.stringify({
            type: 'http',
            number: request.number,
            request: requestJson,
            rejected: {
              code: error instanceof HttpException ? error.getStatus() : 500,
              message: error.message,
              stack: error.stack,
            },
            time: getExecutionTime(startTime),
          }));
          // TODO: This is for test
          // console.error(
          //   request.number + ' ' +
          //   request.method + ' ' +
          //   (error instanceof HttpException ? error.getStatus() : 500) + ' ' +
          //   requestJson.url + ' ' +
          //   getExecutionTime(startTime) + ' ' +
          //   (error instanceof HttpException ? error.message.message : error.message) + ' ' +
          //   error.stack,
          // );

          throw error;
        }),
      );
  }
}

const getExecutionTime = (startTime: number): string => {
  return `${Date.now() - startTime}ms`;
};

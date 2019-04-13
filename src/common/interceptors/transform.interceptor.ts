import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sort from 'smart-deep-sort';
import * as pJson from '../../../package.json';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => {
      return {
        version: pJson.version,
        data: sort(Array.isArray(data) ?
          data.map((e) => e.toJSON()) : data.toJSON()),
      };
    }));
  }
}

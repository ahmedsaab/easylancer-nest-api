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
        data: sortPayload(data),
      };
    }));
  }
}

const sortPayload = (data: any): any => {
  function present(obj) {
    if (obj.hasOwnProperty('toJSON')) {
      return obj.toJSON();
    } else {
      return obj;
    }
  }
  let pojo = {};

  if (Array.isArray(data)) {
    pojo = data.map((e) => present(e));
  } else {
    pojo = present(data);
  }
  return sort(pojo);
};

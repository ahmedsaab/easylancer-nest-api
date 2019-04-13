import { Injectable, NestInterceptor, ExecutionContext, CallHandler, GatewayTimeoutException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { timeoutWith } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeOutThreshold: number;

  constructor(config: ConfigService) {
    this.timeOutThreshold = config.timeOutThreshold;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeoutWith(
        this.timeOutThreshold,
        throwError(new GatewayTimeoutException('request timeout error occurred')),
      ),
    );
  }
}

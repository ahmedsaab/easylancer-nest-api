import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../../config/config.service';

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  private readonly debugMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.debugMode = config.debug;
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 500;
    const message = this.debugMode ?
      exception.message : 'Interval Server Error';

    // console.error(exception);

    response
      .status(status)
      .json({
        statusCode: status,
        message,
      });
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorMessage = string | string[];

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json({
      statusCode,
      message: messageFrom(exception),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

function messageFrom(exception: unknown): ErrorMessage {
  if (!(exception instanceof HttpException)) {
    return 'Internal server error';
  }

  const body = exception.getResponse();

  if (typeof body === 'object' && 'message' in body) {
    return body.message as ErrorMessage;
  }

  return exception.message;
}

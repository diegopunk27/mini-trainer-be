import { CommandBus } from '@cqrs';
import { CreateLogCommand } from '@logs/commands/create-log.command';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<HttpException | Error> {
  constructor(private readonly commandBus: CommandBus) {}

  async catch(
    exception: HttpException | Error,
    host: ArgumentsHost,
  ): Promise<Response<ErrorResponse, Record<string, unknown>>> {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse: ErrorResponse = {
      message: 'An internal server error ocurred, please contact de admins',
    };

    if (exception instanceof HttpException) {
      switch (exception.getStatus()) {
        case HttpStatus.NOT_FOUND:
          errorResponse.message = exception.message;
          return response.status(HttpStatus.NOT_FOUND).json(errorResponse);
        case HttpStatus.CONFLICT:
        case HttpStatus.UNPROCESSABLE_ENTITY:
          errorResponse.message = exception.message;
          return response.status(exception.getStatus()).json(errorResponse);
        case HttpStatus.INTERNAL_SERVER_ERROR:
          await this.createLog(exception);
          return response.status(exception.getStatus()).json(errorResponse);
        default:
          return response.status(exception.getStatus()).json(exception.getResponse());
      }
    }
    await this.createLog(exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  async createLog(exception: Error): Promise<void> {
    const createLogCommand = new CreateLogCommand();
    createLogCommand.message = exception.message;
    createLogCommand.stackTrace = exception.stack!;
    await this.commandBus.execute(createLogCommand);
  }
}

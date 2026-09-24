import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { APIErrorResult } from './api-error-result';
import { CoreConfig, Environments } from '../../core.config';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Все ошибки
@Injectable()
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private readonly coreConfig: CoreConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    console.error('ALL HTTP EXCEPTION:', exception);
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    // Получаем текст ошибки.
    // Если exception является обычной JS/Nest ошибкой, берем её message.
    // Если пришло неизвестное значение, используем сообщение по умолчанию.
    const message =
      exception instanceof Error
        ? exception.message
        : 'Unknown exception occurred.';

    // Определяем HTTP-статус ответа.
    // Если это HttpException, сохраняем статус, который уже был задан исключением
    // Все остальные необработанные ошибки считаем внутренней ошибкой сервера — 500.
    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Для 429 отправляем только статус без тела ответа
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      response.status(HttpStatus.TOO_MANY_REQUESTS).send();
      return;
    }

    // Формируем тело HTTP-ответа в едином формате нашего API.
    const responseBody = this.buildResponseBody(message);

    // Отправляем клиенту HTTP-ответ с вычисленным статусом и сформированным body.
    response.status(status).json(responseBody);
  }

  private buildResponseBody(message: string): APIErrorResult {
    const isProduction = this.coreConfig.env === Environments.PRODUCTION;

    if (isProduction) {
      return {
        errorsMessages: [
          {
            message: 'Some error occurred',
            field: null,
          },
        ],
      };
      // return {
      //   timestamp: new Date().toISOString(),
      //   path: null,
      //   message: 'Some error occurred',
      //   extensions: [],
      //   code: DomainExceptionCode.InternalServerError,
      // };
    }

    return {
      errorsMessages: [
        {
          message,
          field: null,
        },
      ],
    };

    // return {
    //   timestamp: new Date().toISOString(),
    //   path: requestUrl,
    //   message,
    //   extensions: [],
    //   code: DomainExceptionCode.InternalServerError,
    // };
  }
}

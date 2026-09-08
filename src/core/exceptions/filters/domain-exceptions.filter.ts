import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { Response, Request } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';
// import { ErrorResponseBody } from './error-response-body.type';
import { APIErrorResult } from './api-error-result';

//https://docs.nestjs.com/exception-filters#exception-filters-1
// Этот фильтр обрабатывает только ошибки типа DomainException.
// То есть Nest вызовет его, если где-то будет выброшен:
// throw new DomainException(...)
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    // host — это общий контекст выполнения Nest.
    // Nest может работать не только с HTTP, но и, например, с WebSocket/RPC.
    //
    // switchToHttp() говорит:
    // "Нас сейчас интересует именно HTTP-контекст".
    const ctx = host.switchToHttp();

    // Получаем HTTP-response.
    // Через него потом отправим клиенту статус и JSON.
    const response = ctx.getResponse<Response>();

    // Получаем текущий HTTP-request.
    // Из него можем взять url, method, headers и т.д.
    // const request = ctx.getRequest<Request>();

    // Пользователь не аутентифицирован / неверные credentials.
    if (exception.code === DomainExceptionCode.Unauthorized) {
      response.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    // Ресурс не найден.
    if (exception.code === DomainExceptionCode.NotFound) {
      response.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    // exception.code — это наш внутренний код ошибки приложения.
    //
    // Например:
    // DomainExceptionCode.ValidationError = 5
    //
    // Но клиенту нужен обычный HTTP status:
    // ValidationError -> 400
    // NotFound        -> 404
    // Unauthorized    -> 401
    //
    // Поэтому переводим domain code в HTTP status.
    const status = this.mapToHttpStatus(exception.code);

    // Формируем объект, который уйдет клиенту в body ответа.
    //
    // Берем данные из exception:
    // message
    // code
    // extensions
    //
    // И добавляем данные HTTP-запроса:
    // request.url
    const responseBody = this.buildResponseBody(exception);

    // Физически отправляем HTTP-response клиенту.
    //
    // Например:
    // status = 400
    //
    // body =
    // {
    //   timestamp: "...",
    //   path: "/app/users",
    //   message: "Validation failed",
    //   code: 5,
    //   extensions: [...]
    // }
    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    // Переводим внутренние коды приложения
    // в стандартные HTTP status codes.
    switch (code) {
      // Несколько разных domain-ошибок
      // с точки зрения HTTP являются Bad Request.
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      // Нет прав на выполнение операции.
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      // Ресурс не найден.
      // case DomainExceptionCode.NotFound:
      //   return HttpStatus.NOT_FOUND;

      // Пользователь не аутентифицирован / неверные credentials.
      // case DomainExceptionCode.Unauthorized:
      //   return HttpStatus.UNAUTHORIZED;

      // Внутренняя ошибка сервера.
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      // Запасной вариант:
      // если появился неизвестный DomainExceptionCode,
      // который мы забыли добавить в switch.
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,
    // requestUrl: string,
  ): APIErrorResult {
    // Собираем единый формат ошибки, который будет получать клиент.
    return {
      errorsMessages: exception.extensions.map((e) => {
        return {
          message: e.message,
          field: e.key,
        };
      }),
    };

    // return {
    //   // Время возникновения ошибки.
    //   timestamp: new Date().toISOString(),
    //
    //   // Endpoint, на котором произошла ошибка.
    //   path: requestUrl,
    //
    //   // Общее сообщение ошибки.
    //   // Например: "Validation failed".
    //   message: exception.message,
    //
    //   // Наш внутренний код ошибки приложения.
    //   // Например ValidationError = 5.
    //   code: exception.code,
    //
    //   // Дополнительная информация об ошибке.
    //   //
    //   // Для validation ошибок, например:
    //   // [
    //   //   {
    //   //     message: "login must be longer...",
    //   //     key: "login"
    //   //   }
    //   // ]
    //   extensions: exception.extensions,
    // };
  }
}

// Request
// ↓
// ValidationPipe
// ↓
// class-validator проверяет DTO
// ↓
// находит ошибки
// ↓
// создаёт ValidationError[]
// ↓
// ValidationPipe вызывает exceptionFactory(errors)
// ↓
// errorFormatter(errors)
// ↓
// получаем Extension[]
// ↓
// new DomainException(...)
// ↓
// ValidationPipe выбрасывает DomainException
// ↓
// Nest ищет подходящий ExceptionFilter
// ↓
// находит @Catch(DomainException)
// ↓
// DomainHttpExceptionsFilter
// ↓
// domain code → HTTP status
// ↓
// формируем response body
// ↓
// отправляем клиенту

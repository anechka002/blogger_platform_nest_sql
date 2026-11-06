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

// Обрабатывает только DomainException
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    // Переключаемся на HTTP-контекст
    const ctx = host.switchToHttp();

    // Получаем HTTP-response.
    const response = ctx.getResponse<Response>();

    // Получаем текущий HTTP-request.
    // Из него можем взять url, method, headers и т.д.
    // const request = ctx.getRequest<Request>();

    // Пользователь не аутентифицирован / неверные credentials.
    // 401 возвращаем без body
    if (exception.code === DomainExceptionCode.Unauthorized) {
      response.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    // 404 возвращаем без body
    if (exception.code === DomainExceptionCode.NotFound) {
      response.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    // Переводим domain code в HTTP status
    const status = this.mapToHttpStatus(exception.code);

    // Формируем body ошибки
    const responseBody = this.buildResponseBody(exception);

    // Отправляем ответ клиенту
    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    // Переводим внутренние коды приложения в стандартные HTTP status codes.
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

      // Внутренняя ошибка сервера.
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      // Сервис недоступен
      case DomainExceptionCode.ServiceUnavailable:
        return HttpStatus.SERVICE_UNAVAILABLE; // HTTP 503

      // Неизвестный domain code
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,
    // requestUrl: string,
  ): APIErrorResult {
    console.log(exception.message);
    // Приводим extensions к формату API
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

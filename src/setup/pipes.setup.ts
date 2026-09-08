import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации
export const errorFormatter = (
  // Получаем массив сырых ошибок от class-validator
  errors: ValidationError[],
  // Это наш накопительный массив ошибок в нужном нам формате.
  // Если функция вызывается первый раз, создаётся пустой массив [].
  errorsForResponse: Extension[] = [],
): Extension[] => {
  // Проходим по каждой ошибке из массива ValidationError[]
  for (const error of errors) {
    // Если у текущей ошибки НЕТ собственных constraints,
    // но есть вложенные ошибки в children...
    if (!error.constraints && error.children?.length) {
      // ...то вызываем эту же функцию ещё раз.
      // Это рекурсия.
      // Передаём внутрь children и тот же самый накопительный массив.
      errorFormatter(error.children, errorsForResponse);

      // Если у текущей ошибки есть constraints,
      // значит здесь уже есть конкретные ошибки валидации.
    } else if (error.constraints) {
      // Получаем массив ключей из constraints.
      // Например:
      // {
      //   isLength: 'login must be longer...',
      //   isString: 'login must be a string'
      // }
      //
      // После Object.keys получим:
      // ['isLength', 'isString']
      const constraintKeys = Object.keys(error.constraints);

      // Проходим по каждому ключу ошибки.
      // Например сначала key = 'isLength'
      for (const key of constraintKeys) {
        // Добавляем новую ошибку в наш массив Extension[]
        errorsForResponse.push({
          // По ключу получаем текст ошибки:
          // error.constraints['isLength']
          //
          // Если текст существует,
          // добавляем к нему ещё фактически полученное значение.
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',

          // property — имя поля, на котором произошла ошибка.
          // Например 'login', 'email', 'password'
          key: error.property,
        });
      }
    }
  }

  // Возвращаем уже отформатированный массив ошибок.
  // Например:
  // [
  //   {
  //     message: 'login must be longer...; Received value: ',
  //     key: 'login'
  //   }
  // ]
  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  //На следующем занятии рассмотрим подробнее
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,
      //нужен, чтобы Nest удалял из входящего DTO все поля, которых нет среди валидируемых свойств DTO.
      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errorFormatter(errors);

        const exception = new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });

        return exception;
      },
    }),
  );
}

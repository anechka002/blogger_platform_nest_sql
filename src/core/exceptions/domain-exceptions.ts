import { DomainExceptionCode } from './domain-exception-codes';

// Дополнительная информация об ошибке конкретного поля.
export class Extension {
  constructor(
    public message: string,
    public key: string,
  ) {}
}

// Кастомная ошибка приложения.
// Наследуется от встроенного Error.
export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extension[];
  }) {
    // Вызываем constructor родительского Error.
    // Передаём ему message, чтобы наша DomainException
    // была полноценной JavaScript-ошибкой
    // с message, stack trace и другими свойствами Error.
    super(errorInfo.message);

    // Сохраняем данные ошибки в экземпляр.
    this.message = errorInfo.message;
    this.code = errorInfo.code;

    // Если extensions не передали — будет пустой массив.
    this.extensions = errorInfo.extensions || [];
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Добавляем свою проверку перед запуском стратегии Passport 'local'.
  override canActivate(context: ExecutionContext) {
    // Берём body из текущего HTTP-запроса.
    const { body } = context.switchToHttp().getRequest<{
      body?: {
        loginOrEmail?: unknown;
        password?: unknown;
      };
    }>();

    // Собираем ошибки по полям, чтобы вернуть их одним ответом.
    const extensions: { key: string; message: string }[] = [];

    // Логин или email должен быть непустой строкой.
    if (typeof body?.loginOrEmail !== 'string' || !body.loginOrEmail.trim()) {
      extensions.push({
        key: 'loginOrEmail',
        message: 'Login or email is required',
      });
    }

    // Пароль тоже должен быть непустой строкой.
    if (typeof body?.password !== 'string' || !body.password.trim()) {
      extensions.push({
        key: 'password',
        message: 'Password is required',
      });
    }

    // Если тело некорректное, останавливаем запрос с HTTP 400.
    if (extensions.length > 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions,
      });
    }

    // Тело корректное: Passport проверит учётные данные.
    return super.canActivate(context);
  }
}

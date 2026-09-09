import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// если JWT есть, попробовать ли определить пользователя?
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  // canActivate уже есть в родительском AuthGuard.
  // super.canActivate() запускает Passport и JwtStrategy.
  // Этот метод можно удалить, если мы не меняем его поведение.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // Вызывается автоматически после работы Passport/JwtStrategy.
  // err     — ошибка аутентификации.
  // user    — данные, которые вернул validate().
  // info    — дополнительная информация от Passport о результате проверки.
  // context — контекст текущего запроса Nest.
  // status  — дополнительный статус аутентификации.
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status: any,
  ) {
    // Optional auth: если пользователя нет или произошла ошибка,
    // не блокируем запрос, а пропускаем его как guest.
    if (err || !user) {
      return null;
    }

    // Если JWT валидный — возвращаем пользователя.
    // Он будет доступен дальше как request.user.
    return user;
  }
}

// canActivate()
// → запускает Passport
//
// JwtStrategy
// → проверяет JWT
//
// validate()
// → возвращает user
//
// handleRequest()
// → получает результат проверки
// → решает: вернуть user или пропустить гостя

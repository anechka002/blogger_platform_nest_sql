import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { Request } from 'express';

type RequestWithUser = Request & {
  user?: UserContextDto;
};

// Создаем свой кастомный декоратор для параметра метода контроллера.
// Его задача — достать пользователя из текущего HTTP request.
export const ExtractUserFromRequest = createParamDecorator(
  (
    // data — дополнительные данные, которые можно было бы передать в декоратор.
    data: unknown,

    // context — текущий ExecutionContext NestJS.
    // Через него можно получить доступ к HTTP request.
    context: ExecutionContext,
  ): UserContextDto => {
    // Переключаемся именно на HTTP-контекст и получаем текущий request.
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Достаем пользователя из request.user.
    //
    // Сам этот декоратор пользователя туда не кладет.
    // Обычно request.user появляется раньше —
    // например, Guard проверяет access token
    // и после успешной авторизации записывает пользователя в request.user.
    const user = request.user;

    // Если пользователя в request нет,
    // значит ожидаемый flow авторизации нарушен.
    //
    // Например:
    // Guard должен был положить user в request,
    // но по какой-то причине этого не сделал.
    if (!user) {
      throw new Error('в объекте запроса отсутствует пользователь');
    }

    // Возвращаем пользователя.
    //
    // То, что мы здесь return,
    // Nest подставит в параметр метода контроллера.
    return user;
  },
);

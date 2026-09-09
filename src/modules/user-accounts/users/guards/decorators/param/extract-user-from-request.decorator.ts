import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { Request } from 'express';

type RequestWithUser = Request & {
  user?: UserContextDto;
};

// Достаёт request.user и передаёт его в параметр метода контроллера.
export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    // Переключаемся именно на HTTP-контекст и получаем текущий request.
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Достаем пользователя из request.user.
    const user = request.user;

    // Если пользователя в request нет,
    // значит ожидаемый flow авторизации нарушен.
    if (!user) {
      throw new Error('в объекте запроса отсутствует пользователь');
    }

    // Возвращаем пользователя.
    return user;
  },
);

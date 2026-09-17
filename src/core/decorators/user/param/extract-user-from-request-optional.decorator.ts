import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../../../modules/user-accounts/users/guards/dto/user-context.dto';
import { Request } from 'express';

type RequestWithUser = Request & {
  user?: UserContextDto;
};

// Достаёт request.user и передаёт его в параметр метода контроллера или null.
export const ExtractUserFromRequestOptional = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto | null => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Возвращаем пользователя или null
    return request.user ?? null;
  },
);

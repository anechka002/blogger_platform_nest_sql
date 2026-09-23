import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenDto } from '../../guards/dto/refresh-token.dto';

type RequestWithRefreshTokenInfo = Request & {
  user: {
    userId: string;
    deviceId: string;
    iat: number;
  };
};

// декоратор для обработки refresh token текущего пользователя
export const RefreshTokenInfo = createParamDecorator(
  (data: unknown, context: ExecutionContext): RefreshTokenDto => {
    // Переключаемся именно на HTTP-контекст и получаем текущий request.
    const request = context
      .switchToHttp()
      .getRequest<RequestWithRefreshTokenInfo>();

    // Возвращаем пользователя.
    return {
      userId: request.user.userId,
      deviceId: request.user.deviceId,
      iat: request.user.iat,
    };
  },
);

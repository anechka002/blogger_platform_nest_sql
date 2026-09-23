import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAccountsConfig } from '../../../modules/user-accounts/users/config/user-accounts.config';

type RefreshTokenPayload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(usersAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // Объект, у которого ключи — строки, а значения пока неизвестного типа
          const cookies = request.cookies as
            Record<string, unknown> | undefined;

          // берём значение по ключу 'refresh-token'
          const refreshToken = cookies?.['refreshToken'];

          // если string → возвращаем токен, если нет → null
          return typeof refreshToken === 'string' ? refreshToken : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: usersAccountsConfig.refreshTokenSecret,
    });
  }

  async validate(payload: RefreshTokenPayload) {
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}

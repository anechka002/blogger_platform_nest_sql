import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAccountsConfig } from '../../../modules/user-accounts/users/config/user-accounts.config';
import { SessionSqlRepository } from '../../../modules/user-accounts/users/infrastructure/session-sql.repository';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';

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
  constructor(
    usersAccountsConfig: UserAccountsConfig,
    private readonly sessionSqlRepository: SessionSqlRepository,
  ) {
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
    const session = await this.sessionSqlRepository.findActiveByDeviceId(
      payload.deviceId,
    );

    if (
      !session || // Нет активной сессии
      session.userId !== payload.userId || // Не тот владелец
      session.issuedAt.getTime() !== payload.iat * 1000 // Токен не совпадает с текущим выпуском
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired session',
      });
    }

    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}

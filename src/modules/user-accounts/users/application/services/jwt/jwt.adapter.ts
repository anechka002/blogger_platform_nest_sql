import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RefreshTokenPayloadType } from '../../../../../../core/types/refresh-token-payload.type';

// адаптер для работы с jwt
@Injectable()
export class JwtAdapter {
  public constructor(private readonly jwtService: JwtService) {}

  private async createToken({
    payload,
    secret,
    expiresIn,
  }: {
    payload: object;
    secret: string;
    expiresIn: JwtSignOptions['expiresIn'];
  }): Promise<string> {
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  public async createAccessAndRefreshTokens({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }) {
    const accessToken = await this.createToken({
      payload: { userId },
      // каким секретом подписывать JWT и потом проверять подпись;
      secret: 'access-token-secret',
      // сколько времени токен будет жить.
      expiresIn: '10m',
    });

    const refreshToken = await this.createToken({
      payload: { userId, deviceId },
      secret: 'refresh-token-secret',
      expiresIn: '30m',
    });

    // decode() достаёт payload из токена.
    const payload: RefreshTokenPayloadType =
      await this.jwtService.decode(refreshToken);

    return { accessToken, refreshToken, payload };
  }
}

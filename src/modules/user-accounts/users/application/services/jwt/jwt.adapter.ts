import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RefreshTokenPayloadType } from '../../../../../../core/types/refresh-token-payload.type';
import { UserAccountsConfig } from '../../../config/user-accounts.config';

// адаптер для работы с jwt
@Injectable()
export class JwtAdapter {
  public constructor(
    private readonly userAccountsConfig: UserAccountsConfig,
    private readonly jwtService: JwtService,
  ) {}

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
      secret: this.userAccountsConfig.accessTokenSecret,
      // сколько времени токен будет жить.
      expiresIn: this.userAccountsConfig
        .accessTokenExpireIn as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.createToken({
      payload: { userId, deviceId },
      secret: this.userAccountsConfig.refreshTokenSecret,
      expiresIn: this.userAccountsConfig
        .refreshTokenExpireIn as JwtSignOptions['expiresIn'],
    });

    // decode() достаёт payload из токена.
    const payload: RefreshTokenPayloadType =
      await this.jwtService.decode(refreshToken);

    return { accessToken, refreshToken, payload };
  }
}

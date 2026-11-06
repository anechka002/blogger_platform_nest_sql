import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../services/jwt/jwt.adapter';
import { TokensPairType } from '../../../../../../core/types/tokens-pair.type';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { SessionSqlRepository } from '../../../infrastructure/session-sql.repository';

export class RefreshTokenCommand {
  constructor(public dto: { userId: string; deviceId: string; iat: number }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<
  RefreshTokenCommand,
  TokensPairType
> {
  constructor(
    private jwtAdapter: JwtAdapter,
    private sessionSqlRepository: SessionSqlRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokensPairType> {
    const { userId, deviceId, iat } = command.dto;

    // Ищем активную session текущего устройства.
    const session =
      await this.sessionSqlRepository.findActiveByDeviceId(deviceId);

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Проверяем, что session принадлежит пользователю из refresh token.
    if (session.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Проверяем, что пришёл последний актуальный refresh token этой session.
    const tokenIssuedAt = new Date(iat * 1000);
    if (session.issuedAt.getTime() !== tokenIssuedAt.getTime()) {
      // старый refresh token
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Создаём новую пару токенов для той же device session.
    const { accessToken, refreshToken, payload } =
      await this.jwtAdapter.createAccessAndRefreshTokens({
        userId,
        deviceId,
      });

    // Обновляем session данными нового refresh token.
    const issuedAt = new Date(payload.iat * 1000);
    const expirationDate = new Date(payload.exp * 1000);

    await this.sessionSqlRepository.updateRefreshToken(
      session.deviceId,
      issuedAt,
      expirationDate,
    );

    return { accessToken, refreshToken };
  }
}

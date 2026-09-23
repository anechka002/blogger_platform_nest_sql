import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../services/jwt/jwt.adapter';
import { TokensPairType } from '../../../../../core/types/tokens-pair.type';
import { SessionRepository } from '../../infrastructure/session.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

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
    private sessionRepository: SessionRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokensPairType> {
    const { userId, deviceId, iat } = command.dto;

    // Ищем активную session текущего устройства.
    const session = await this.sessionRepository.findByDeviceId(deviceId);

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

    session.updateRefreshToken({ issuedAt, expirationDate });

    await this.sessionRepository.saveSession(session);

    return { accessToken, refreshToken };
  }
}

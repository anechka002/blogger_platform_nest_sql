import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../services/jwt/jwt.adapter';
import { randomUUID } from 'node:crypto';
import { TokensPairType } from '../../../../../../core/types/tokens-pair.type';
import { SessionSqlRepository } from '../../../infrastructure/session-sql.repository';

type LoginUserCommandParams = {
  userId: string;
  deviceName: string;
  ipAddress: string;
};

export class LoginUserCommand {
  constructor(public dto: LoginUserCommandParams) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  TokensPairType
> {
  constructor(
    private jwtAdapter: JwtAdapter,
    private sessionSqlRepository: SessionSqlRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<TokensPairType> {
    const { userId, deviceName, ipAddress } = command.dto;

    const deviceId = randomUUID();

    const { accessToken, refreshToken, payload } =
      await this.jwtAdapter.createAccessAndRefreshTokens({
        userId,
        deviceId,
      });

    const session = {
      deviceId,
      userId,
      deviceName,
      ip: ipAddress,
      expirationDate: new Date(payload.exp * 1000),
      issuedAt: new Date(payload.iat * 1000),
    };

    await this.sessionSqlRepository.createSession(session);

    return { accessToken, refreshToken };
  }
}

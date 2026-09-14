import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../../../../core/jwt/jwt.adapter';
import { randomUUID } from 'node:crypto';
import { TokensPairType } from '../../../../../core/types/tokens-pair.type';

export class LoginUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  TokensPairType
> {
  constructor(private jwtAdapter: JwtAdapter) {}

  async execute(command: LoginUserCommand): Promise<TokensPairType> {
    const userId = command.id;

    const deviceId = randomUUID();

    const { accessToken, refreshToken } =
      await this.jwtAdapter.createAccessAndRefreshTokens({
        userId,
        deviceId,
      });

    return { accessToken, refreshToken };
  }
}

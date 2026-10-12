import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MeViewDto } from './view-dto/me.view.dto';
import { ExtractUserFromRequest } from '../../../../core/decorators/user/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegistrationConfirmationCodeInputDto } from './input-dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { NewPasswordRecoveryInputDto } from './input-dto/new-password-recovery.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { LocalAuthGuard } from '../../../../core/guards/local/local-auth.guard';
import { AccessTokenViewDto } from './view-dto/login.view-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmCodeCommand } from '../application/use-cases/confirm-code.use-case';
import { RegisterEmailResendingCommand } from '../application/use-cases/register-email-resending.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { NewPasswordRecoveryCommand } from '../application/use-cases/new-password-recovery.use-case';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { TokensPairType } from '../../../../core/types/tokens-pair.type';
import { RegisterSwagger } from './swagger/auth/register.swagger.decorator';
import { ConfirmSwagger } from './swagger/auth/confirm.swagger.decorator';
import { RegistrationEmailResendingSwagger } from './swagger/auth/registration-email-resending.swagger.decorator';
import { PasswordRecoverySwagger } from './swagger/auth/password-recovery.swagger.decorator';
import { NewPasswordRecoverySwagger } from './swagger/auth/new-password-recovery.swagger.decorator';
import { LoginSwagger } from './swagger/auth/login.swagger.decorator';
import { MeSwagger } from './swagger/auth/me.swagger.decorator';
import { RefreshTokenAuthGuard } from '../../../../core/guards/bearer/refresh-token.auth.guard';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { RefreshTokenInfo } from './decorators/refresh-token-info.decorator';
import { RefreshTokenDto } from '../guards/dto/refresh-token.dto';
import { LogoutUserCommand } from '../application/use-cases/logout-user.use-case';
import { RefreshTokenSwagger } from './swagger/auth/refresh-token.swagger.decorator';
import { LogoutSwagger } from './swagger/auth/logout.swagger.decorator';
import { AuthSqlQueryRepository } from '../infrastructure/query/auth-sql.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authSqlQueryRepository: AuthSqlQueryRepository,
    private readonly commandBus: CommandBus,
  ) {
    console.log('AuthController created');
  }

  @RegisterSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute<RegisterUserCommand, void>(
      new RegisterUserCommand(body),
    );
  }

  @ConfirmSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  async confirm(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    return this.commandBus.execute<ConfirmCodeCommand, void>(
      new ConfirmCodeCommand(body.code),
    );
  }

  @RegistrationEmailResendingSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  async registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute<RegisterEmailResendingCommand, void>(
      new RegisterEmailResendingCommand(body.email),
    );
  }

  @PasswordRecoverySwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    return this.commandBus.execute<PasswordRecoveryCommand, void>(
      new PasswordRecoveryCommand(body.email),
    );
  }

  @NewPasswordRecoverySwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  async newPasswordRecovery(
    @Body() body: NewPasswordRecoveryInputDto,
  ): Promise<void> {
    return this.commandBus.execute<NewPasswordRecoveryCommand, void>(
      new NewPasswordRecoveryCommand(body),
    );
  }

  @MeSwagger()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authSqlQueryRepository.meOrNotFoundFail(user.id);
  }

  @LoginSwagger()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Post('login')
  async login(
    @Body() body: LoginInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    // я немного меняю response, но Nest всё ещё сам его отправляет
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenViewDto> {
    const deviceName: string = req.headers['user-agent'] ?? 'unknown';
    const ipAddress: string = req.ip as string;

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      TokensPairType
    >(
      new LoginUserCommand({
        userId: user.id,
        deviceName,
        ipAddress,
      }),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 1000,
    });

    return { accessToken };
  }

  @RefreshTokenSwagger()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @RefreshTokenInfo() refreshTokenInfo: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenViewDto> {
    const result = await this.commandBus.execute<
      RefreshTokenCommand,
      TokensPairType
    >(
      new RefreshTokenCommand({
        userId: refreshTokenInfo.userId,
        deviceId: refreshTokenInfo.deviceId,
        iat: refreshTokenInfo.iat,
      }),
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }

  @LogoutSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  @Post('logout')
  async logout(
    @RefreshTokenInfo() refreshTokenInfo: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.commandBus.execute<LogoutUserCommand, void>(
      new LogoutUserCommand({
        userId: refreshTokenInfo.userId,
        deviceId: refreshTokenInfo.deviceId,
        oldIat: refreshTokenInfo.iat,
      }),
    );

    res.clearCookie('refreshToken');
  }
}

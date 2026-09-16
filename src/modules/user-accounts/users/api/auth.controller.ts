import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { MeViewDto } from './view-dto/me.view.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
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

@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
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
    return this.authQueryRepository.meOrNotFoundFail(user.id);
  }

  @LoginSwagger()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() body: LoginInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
    // я немного меняю response, но Nest всё ещё сам его отправляет
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenViewDto> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      TokensPairType
    >(new LoginUserCommand(user.id));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 1000,
    });

    return { accessToken };
  }
}

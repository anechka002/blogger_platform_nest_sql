import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeViewDto } from './view-dto/me.view.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APIErrorResult } from '../../../../core/exceptions/filters/api-error-result';
import { RegistrationConfirmationCodeInputDto } from './input-dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { NewPasswordRecoveryInputDto } from './input-dto/new-password-recovery.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { LoginViewDto } from './view-dto/login.view-dto';
import { LoginInputDto } from './input-dto/login.input-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    console.log('AuthController created');
  }

  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @ApiBody({
    description: 'Data for registration',
    type: CreateUserInputDto,
  })
  @ApiNoContentResponse({
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
    type: APIErrorResult,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @ApiOperation({
    summary: 'Confirm registration',
  })
  @ApiBody({
    type: RegistrationConfirmationCodeInputDto,
  })
  @ApiNoContentResponse({
    description: 'Email was verified. Account was activated',
  })
  @ApiBadRequestResponse({
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    type: APIErrorResult,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  async confirm(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    return this.usersService.confirmCode(body.code);
  }

  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @ApiNoContentResponse({
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  async registrationEmailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.usersService.registrationEmailResending(body.email);
  }

  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @ApiNoContentResponse({
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has invalid email (for example 222^gmail.com)',
    type: APIErrorResult,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    return this.usersService.passwordRecovery(body.email);
  }

  @ApiOperation({
    summary: 'Confirm Password recovery',
  })
  @ApiNoContentResponse({
    description: 'If code is valid and new password is accepted',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    type: APIErrorResult,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  async newPasswordRecovery(
    @Body() body: NewPasswordRecoveryInputDto,
  ): Promise<void> {
    return this.usersService.newPasswordRecovery(body);
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get information about current user',
  })
  @ApiOkResponse({
    description: 'Success',
    type: MeViewDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.meOrNotFoundFail(user.id);
  }

  @ApiOperation({
    summary: 'Try login user to the system',
  })
  @ApiOkResponse({
    description: 'Returns JWT accessToken (expired after 5 minutes) in body.',
    type: LoginViewDto,
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
  })
  @ApiUnauthorizedResponse({
    description: 'If the password or login or email is wrong',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() body: LoginInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<LoginViewDto> {
    return this.authService.login(user.id);
  }
}

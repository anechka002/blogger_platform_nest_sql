import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { User } from '../../domain/user.entity';
import { PasswordService } from '../services/password.service';
import { EmailService } from '../../../../notifications/email.service';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  void
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const { login, email, password } = dto;

    const userByEmail = await this.usersRepository.findByEmail(email);
    if (userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        extensions: [
          {
            message: 'Email should be unique',
            key: 'email',
          },
        ],
      });
    }

    const userByLogin = await this.usersRepository.findByLogin(login);
    if (userByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        extensions: [
          {
            message: 'Login should be unique',
            key: 'login',
          },
        ],
      });
    }

    const passwordHash: string =
      await this.passwordService.generateHash(password);

    const user = User.createForRegistration({
      login,
      email,
      passwordHash,
    });

    const createdUser = await this.usersRepository.create(user);

    this.emailService
      .sendRegistrationConfirmationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      )
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }
}

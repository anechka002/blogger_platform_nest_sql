import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PasswordService } from '../../services/password.service';
import { EmailService } from '../../../../../notifications/email.service';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  void
> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const { login, email, password } = dto;

    const userByEmail = await this.usersSqlRepository.findByEmail(email);
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

    const userByLogin = await this.usersSqlRepository.findByLogin(login);
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

    const confirmationCode = randomUUID();
    const confirmationExpirationDate = addHours(new Date(), 1);
    const isConfirmed = false;

    await this.usersSqlRepository.createUserWithAccountState(
      { login, email, passwordHash },
      isConfirmed,
      confirmationCode,
      confirmationExpirationDate,
    );

    this.emailService
      .sendRegistrationConfirmationEmail(email, confirmationCode)
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }
}

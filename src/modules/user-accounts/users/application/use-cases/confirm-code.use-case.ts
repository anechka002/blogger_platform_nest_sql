import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from '../services/password.service';
import { EmailService } from '../../../../notifications/email.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class ConfirmCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmCodeCommand)
// Подтверждает регистрацию пользователя по коду подтверждения
export class ConfirmCodeUseCase implements ICommandHandler<
  ConfirmCodeCommand,
  void
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ code }: ConfirmCodeCommand): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(code);

    // код не найден → 400
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [
          { message: 'Confirmation code is incorrect', key: 'code' },
        ],
      });
    }

    // email уже подтверждён → 400
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [{ message: 'Email is already confirmed', key: 'email' }],
      });
    }

    // код истёк → 400
    if (
      !user.emailConfirmation.expirationDate ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code is expired',
        extensions: [{ message: 'Confirmation code is expired', key: 'code' }],
      });
    }

    // После успешных проверок меняем состояние пользователя
    user.confirmEmail();

    // сохраняем изменения в MongoDB
    await this.usersRepository.save(user);
  }
}

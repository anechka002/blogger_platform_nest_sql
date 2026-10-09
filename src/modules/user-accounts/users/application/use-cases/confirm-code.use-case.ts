import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersSqlRepository } from '../../infrastructure/users-sql.repository';

export class ConfirmCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmCodeCommand)
// Подтверждает регистрацию пользователя по коду подтверждения
export class ConfirmCodeUseCase implements ICommandHandler<
  ConfirmCodeCommand,
  void
> {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute({ code }: ConfirmCodeCommand): Promise<void> {
    // const user = await this.usersRepository.findByConfirmationCode(code);
    const confirmation =
      await this.usersSqlRepository.findByConfirmationCode(code);

    // код не найден → 400
    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [
          { message: 'Confirmation code is incorrect', key: 'code' },
        ],
      });
    }

    // email уже подтверждён → 400
    if (confirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [{ message: 'Email is already confirmed', key: 'email' }],
      });
    }

    // код истёк → 400
    if (
      !confirmation.confirmationExpirationDate ||
      confirmation.confirmationExpirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code is expired',
        extensions: [{ message: 'Confirmation code is expired', key: 'code' }],
      });
    }

    // UPDATE: устанавливаем isConfirmed = true
    await this.usersSqlRepository.confirmEmail(code);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../../notifications/email.service';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    // Находим пользователя вместе с подтверждением одним запросом
    const user =
      await this.usersSqlRepository.findUserWithEmailConfirmationByEmail(email);
    // Если пользователя нет — просто молча выходим (как будто всё ок)
    if (!user) {
      return;
    }

    // Дополнительно проверяем, подтверждён ли email
    if (!user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'Email is not confirmed',
        extensions: [{ message: 'Email is not confirmed', key: 'email' }],
      });
    }

    // создали recoveryCode
    const newRecoveryCode = randomUUID();
    // создали expirationDate
    const newRecoveryExpirationDate = addHours(new Date(), 1);

    await this.usersSqlRepository.refreshRecoveryCode(
      user.id,
      newRecoveryCode,
      newRecoveryExpirationDate,
    );

    // отправили письмо со ссылкой
    this.emailService
      .sendPasswordRecoveryEmail(user.email, newRecoveryCode)
      .catch((error) => console.log('error in send email', error));
  }
}

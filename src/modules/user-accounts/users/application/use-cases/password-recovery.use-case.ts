import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/email.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    // нашли user по email
    const user = await this.usersRepository.findByEmail(email);
    // Если пользователя нет — просто молча выходим (как будто всё ок)
    if (!user) {
      return;
    }

    // Дополнительно проверяем, подтверждён ли email
    if (!user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'Email is not confirmed',
        extensions: [{ message: 'Email is not confirmed', key: 'email' }],
      });
    }

    // создали recoveryCode
    const recoveryCode = randomUUID();
    // создали expirationDate
    const expirationDate = addHours(new Date(), 1);

    user.setPasswordRecovery(recoveryCode, expirationDate);

    await this.usersRepository.save(user);

    // отправили письмо со ссылкой
    this.emailService
      .sendPasswordRecoveryEmail(user.email, recoveryCode)
      .catch((error) => console.log('error in send email', error));
  }
}

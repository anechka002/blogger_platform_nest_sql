import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../../notifications/email.service';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class RegisterEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegisterEmailResendingCommand)
// Повторно отправляет письмо для подтверждения регистрации
export class RegisterEmailResendingUseCase implements ICommandHandler<
  RegisterEmailResendingCommand,
  void
> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: RegisterEmailResendingCommand): Promise<void> {
    // Находим пользователя вместе с подтверждением одним запросом
    const user =
      await this.usersSqlRepository.findUserWithEmailConfirmationByEmail(email);

    // Пользователь или запись подтверждения не найдены → 400
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User or Email confirmation not found',
        extensions: [
          { message: 'User or Email confirmation not found', key: 'email' },
        ],
      });
    }

    // Email уже подтверждён → 400
    if (user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ message: 'Email is already confirmed', key: 'email' }],
      });
    }

    // Генерируем новый confirmationCode
    const newConfirmationCode = randomUUID();

    // Генерируем новую expirationDate
    const newExpirationDate = addHours(new Date(), 1);

    // Сохраняем новый код и срок действия в PostgreSQL
    await this.usersSqlRepository.refreshEmailConfirmation(
      user.id,
      newConfirmationCode,
      newExpirationDate,
    );

    // Отправляем письмо с новым кодом
    this.emailService
      .sendRegistrationConfirmationEmail(user.email, newConfirmationCode)
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }
}

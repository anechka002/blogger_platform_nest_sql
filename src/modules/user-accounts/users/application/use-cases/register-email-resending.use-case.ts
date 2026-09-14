import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/email.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';

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
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: RegisterEmailResendingCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    // Если user не найден → 400
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is not registered',
        extensions: [{ message: 'Email is not registered', key: 'email' }],
      });
    }

    // Если user уже подтверждён → 400
    if (user.emailConfirmation.isConfirmed) {
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

    // Обновляем код подтверждения и срок его действия у найденного пользователя в памяти
    user.refreshEmailConfirmation(newConfirmationCode, newExpirationDate);

    // Сохраняем обновлённый confirmationCode и новую expirationDate в MongoDB
    await this.usersRepository.save(user);

    // Отправляем новое письмо
    this.emailService
      .sendRegistrationConfirmationEmail(user.email, newConfirmationCode)
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }
}

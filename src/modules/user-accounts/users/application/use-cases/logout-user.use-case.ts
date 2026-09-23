import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infrastructure/session.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class LogoutUserCommand {
  constructor(
    public dto: { userId: string; deviceId: string; oldIat: number },
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<
  LogoutUserCommand,
  void
> {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(command: LogoutUserCommand): Promise<void> {
    const { userId, deviceId, oldIat } = command.dto;

    // Ищем активную session текущего устройства.
    const session = await this.sessionRepository.findByDeviceId(deviceId);
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized user',
      });
    }

    // Проверяем, что session принадлежит пользователю из refresh token.
    if (session.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Проверяем, что logout выполняется по актуальному refresh token.
    const issuedAt = new Date(oldIat * 1000);
    if (session.issuedAt.getTime() !== issuedAt.getTime()) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Завершаем текущую device session.
    session.makeDeleted();

    await this.sessionRepository.saveSession(session);
  }
}

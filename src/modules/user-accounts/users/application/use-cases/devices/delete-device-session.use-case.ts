import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';

export class DeleteDeviceSessionCommand {
  constructor(
    public targetDeviceId: string, // из params
    public currentUserId: string, // из refresh token context
  ) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionUseCase implements ICommandHandler<
  DeleteDeviceSessionCommand,
  void
> {
  constructor(public sessionRepository: SessionRepository) {}

  async execute(dto: DeleteDeviceSessionCommand): Promise<void> {
    const session = await this.sessionRepository.findByDeviceId(
      dto.targetDeviceId,
    );

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    if (session.userId !== dto.currentUserId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    session.makeDeleted();

    await this.sessionRepository.saveSession(session);
  }
}

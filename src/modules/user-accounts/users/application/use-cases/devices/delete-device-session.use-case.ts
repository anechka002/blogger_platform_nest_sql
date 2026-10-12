import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { SessionSqlRepository } from '../../../infrastructure/session-sql.repository';

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
  constructor(private readonly sessionSqlRepository: SessionSqlRepository) {}

  async execute(dto: DeleteDeviceSessionCommand): Promise<void> {
    const session = await this.sessionSqlRepository.findActiveByDeviceId(
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

    await this.sessionSqlRepository.deleteSession(session.deviceId);
  }
}

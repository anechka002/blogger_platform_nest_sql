import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionSqlRepository } from '../../../infrastructure/session-sql.repository';

export class DeleteAllDevicesSessionsCommand {
  constructor(
    public currentUserId: string, // из refresh token context
    public currentDeviceId: string, // из refresh token context
  ) {}
}

@CommandHandler(DeleteAllDevicesSessionsCommand)
export class DeleteAllDevicesSessionsUseCase implements ICommandHandler<
  DeleteAllDevicesSessionsCommand,
  void
> {
  constructor(public sessionSqlRepository: SessionSqlRepository) {}

  async execute(dto: DeleteAllDevicesSessionsCommand): Promise<void> {
    await this.sessionSqlRepository.deleteAllExceptCurrent({
      deviceId: dto.currentDeviceId,
      userId: dto.currentUserId,
    });
  }
}

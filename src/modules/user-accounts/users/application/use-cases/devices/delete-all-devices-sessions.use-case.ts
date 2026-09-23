import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';

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
  constructor(public sessionRepository: SessionRepository) {}

  async execute(dto: DeleteAllDevicesSessionsCommand): Promise<void> {
    await this.sessionRepository.deleteAllExceptCurrent({
      deviceId: dto.currentDeviceId,
      userId: dto.currentUserId,
    });
  }
}

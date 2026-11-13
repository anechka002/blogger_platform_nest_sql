import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import {
  DeleteAllDevicesSessionsCommand,
  DeleteAllDevicesSessionsUseCase,
} from '../application/use-cases/devices/delete-all-devices-sessions.use-case';
import { SessionSqlRepository } from '../infrastructure/session-sql.repository';

describe('DeleteAllDeviceSessionUseCase', () => {
  let deleteAllDevicesSessionsUseCase: DeleteAllDevicesSessionsUseCase;
  let sessionSqlRepository: SessionSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        DeleteAllDevicesSessionsUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: SessionSqlRepository,
          useValue: {
            deleteAllExceptCurrent: jest.fn(),
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    deleteAllDevicesSessionsUseCase =
      module.get<DeleteAllDevicesSessionsUseCase>(
        DeleteAllDevicesSessionsUseCase,
      );
    // заглушку репозитория блогов;
    sessionSqlRepository =
      module.get<SessionSqlRepository>(SessionSqlRepository);
  });

  it('should delete all user sessions except the current one', async () => {
    const userId = 'userId-1';
    const deviceId = 'deviceId-1';

    const command = new DeleteAllDevicesSessionsCommand(userId, deviceId);

    const deleteSessionsSpy = jest
      .spyOn(sessionSqlRepository, 'deleteAllExceptCurrent')
      .mockResolvedValue(undefined);

    await deleteAllDevicesSessionsUseCase.execute(command);

    expect(deleteSessionsSpy).toHaveBeenCalledTimes(1);
    expect(deleteSessionsSpy).toHaveBeenCalledWith({
      userId,
      deviceId,
    });
  });
});

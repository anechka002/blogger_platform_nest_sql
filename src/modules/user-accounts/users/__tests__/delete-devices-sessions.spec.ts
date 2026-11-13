import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { SessionSqlRepository } from '../infrastructure/session-sql.repository';
import {
  DeleteDeviceSessionCommand,
  DeleteDeviceSessionUseCase,
} from '../application/use-cases/devices/delete-device-session.use-case';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

describe('DeleteDeviceSessionUseCase', () => {
  let deleteDeviceSessionUseCase: DeleteDeviceSessionUseCase;
  let sessionSqlRepository: SessionSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        DeleteDeviceSessionUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: SessionSqlRepository,
          useValue: {
            findActiveByDeviceId: jest.fn(),
            deleteSession: jest.fn(),
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    deleteDeviceSessionUseCase = module.get<DeleteDeviceSessionUseCase>(
      DeleteDeviceSessionUseCase,
    );
    // заглушку репозитория блогов;
    sessionSqlRepository =
      module.get<SessionSqlRepository>(SessionSqlRepository);
  });

  it('should delete a device session owned by the user', async () => {
    const userId = 'userId-1';
    const deviceId = 'deviceId-1';
    const now = new Date();

    const command = new DeleteDeviceSessionCommand(deviceId, userId);

    const findSessionSpy = jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue({
        deviceId,
        userId,
        deviceName: 'Test device',
        ip: '127.0.0.1',
        issuedAt: now,
        expirationDate: new Date(now.getTime() + 60_000),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

    const deleteSessionsSpy = jest
      .spyOn(sessionSqlRepository, 'deleteSession')
      .mockResolvedValue(undefined);

    await deleteDeviceSessionUseCase.execute(command);

    expect(findSessionSpy).toHaveBeenCalledWith(deviceId);
    expect(deleteSessionsSpy).toHaveBeenCalledTimes(1);
    expect(deleteSessionsSpy).toHaveBeenCalledWith(deviceId);
  });

  it('should throw NotFound when the device session does not exist', async () => {
    const deviceId = 'device-1';
    const userId = 'user-1';
    const command = new DeleteDeviceSessionCommand(deviceId, userId);

    const findSessionSpy = jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(null);

    const deleteSessionSpy = jest.spyOn(sessionSqlRepository, 'deleteSession');

    await expect(
      deleteDeviceSessionUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });

    expect(findSessionSpy).toHaveBeenCalledWith(deviceId);
    expect(deleteSessionSpy).not.toHaveBeenCalled();
  });

  it('should throw Forbidden when the device session belongs to another user', async () => {
    const deviceId = 'device-1';
    const currentUserId = 'user-1';
    const now = new Date();

    const command = new DeleteDeviceSessionCommand(deviceId, currentUserId);

    jest.spyOn(sessionSqlRepository, 'findActiveByDeviceId').mockResolvedValue({
      deviceId,
      userId: 'user-2',
      deviceName: 'Test device',
      ip: '127.0.0.1',
      issuedAt: now,
      expirationDate: new Date(now.getTime() + 60_000),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const deleteSessionSpy = jest.spyOn(sessionSqlRepository, 'deleteSession');

    await expect(
      deleteDeviceSessionUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.Forbidden,
    });

    expect(deleteSessionSpy).not.toHaveBeenCalled();
  });
});

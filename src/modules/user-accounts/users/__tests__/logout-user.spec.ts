import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { SessionSqlRepository } from '../infrastructure/session-sql.repository';
import {
  LogoutUserCommand,
  LogoutUserUseCase,
} from '../application/use-cases/public/logout-user.use-case';

describe('LogoutUserUseCase', () => {
  let logoutUserUseCase: LogoutUserUseCase;
  let sessionSqlRepository: SessionSqlRepository;

  const userId = 'user-1';
  const deviceId = 'device-1';
  const oldIat = 1_700_000_000;

  const session = {
    userId,
    deviceId,
    deviceName: 'Test device',
    ip: '127.0.0.1',
    issuedAt: new Date(oldIat * 1000),
    expirationDate: new Date((oldIat + 120) * 1000),
    createdAt: new Date(oldIat * 1000),
    updatedAt: new Date(oldIat * 1000),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUserUseCase,
        {
          provide: SessionSqlRepository,
          useValue: {
            findActiveByDeviceId: jest.fn(),
            deleteSession: jest.fn(),
          },
        },
      ],
    }).compile();

    logoutUserUseCase = module.get<LogoutUserUseCase>(LogoutUserUseCase);
    sessionSqlRepository = module.get(SessionSqlRepository);
  });

  it('should delete the current session when the user and iat match', async () => {
    const command = new LogoutUserCommand({ userId, deviceId, oldIat });

    const findSessionSpy = jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(session);

    const deleteSessionSpy = jest
      .spyOn(sessionSqlRepository, 'deleteSession')
      .mockResolvedValue(undefined);

    await logoutUserUseCase.execute(command);

    expect(findSessionSpy).toHaveBeenCalledWith(deviceId);
    expect(deleteSessionSpy).toHaveBeenCalledTimes(1);
    expect(deleteSessionSpy).toHaveBeenCalledWith(deviceId);
  });

  it('should throw Unauthorized when no active session exists', async () => {
    const command = new LogoutUserCommand({ userId, deviceId, oldIat });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(null);

    const deleteSessionSpy = jest.spyOn(sessionSqlRepository, 'deleteSession');

    await expect(logoutUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(deleteSessionSpy).not.toHaveBeenCalled();
  });

  it('should throw Unauthorized when the session belongs to another user', async () => {
    const command = new LogoutUserCommand({ userId, deviceId, oldIat });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue({ ...session, userId: 'user-2' });

    const deleteSessionSpy = jest.spyOn(sessionSqlRepository, 'deleteSession');

    await expect(logoutUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(deleteSessionSpy).not.toHaveBeenCalled();
  });

  it('should throw Unauthorized when the refresh token iat is stale', async () => {
    const command = new LogoutUserCommand({
      userId,
      deviceId,
      oldIat: oldIat - 1,
    });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(session);

    const deleteSessionSpy = jest.spyOn(sessionSqlRepository, 'deleteSession');

    await expect(logoutUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(deleteSessionSpy).not.toHaveBeenCalled();
  });
});

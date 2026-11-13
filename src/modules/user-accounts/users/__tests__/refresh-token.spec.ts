import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { JwtAdapter } from '../application/services/jwt/jwt.adapter';
import { SessionSqlRepository } from '../infrastructure/session-sql.repository';
import {
  RefreshTokenCommand,
  RefreshTokenUseCase,
} from '../application/use-cases/public/refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let jwtAdapter: JwtAdapter;
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
        RefreshTokenUseCase,
        {
          provide: JwtAdapter,
          useValue: {
            createAccessAndRefreshTokens: jest.fn(),
          },
        },
        {
          provide: SessionSqlRepository,
          useValue: {
            findActiveByDeviceId: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    jwtAdapter = module.get(JwtAdapter);
    sessionSqlRepository = module.get(SessionSqlRepository);
  });

  it('should update the current session and return new tokens', async () => {
    const command = new RefreshTokenCommand({ userId, deviceId, iat: oldIat });
    const accessToken = 'new-access-token';
    const refreshToken = 'new-refresh-token';
    const newIat = oldIat + 30;
    const newExp = newIat + 120;

    const findSessionSpy = jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(session);

    const createTokensSpy = jest
      .spyOn(jwtAdapter, 'createAccessAndRefreshTokens')
      .mockResolvedValue({
        accessToken,
        refreshToken,
        payload: { userId, deviceId, iat: newIat, exp: newExp },
      });

    const updateRefreshTokenSpy = jest
      .spyOn(sessionSqlRepository, 'updateRefreshToken')
      .mockResolvedValue(undefined);

    const result = await refreshTokenUseCase.execute(command);

    expect(findSessionSpy).toHaveBeenCalledWith(deviceId);
    expect(createTokensSpy).toHaveBeenCalledWith({ userId, deviceId });
    expect(updateRefreshTokenSpy).toHaveBeenCalledTimes(1);
    expect(updateRefreshTokenSpy).toHaveBeenCalledWith(
      deviceId,
      new Date(newIat * 1000),
      new Date(newExp * 1000),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('should throw Unauthorized when no active session exists', async () => {
    const command = new RefreshTokenCommand({ userId, deviceId, iat: oldIat });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(null);

    const createTokensSpy = jest.spyOn(
      jwtAdapter,
      'createAccessAndRefreshTokens',
    );
    const updateRefreshTokenSpy = jest.spyOn(
      sessionSqlRepository,
      'updateRefreshToken',
    );

    await expect(refreshTokenUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(createTokensSpy).not.toHaveBeenCalled();
    expect(updateRefreshTokenSpy).not.toHaveBeenCalled();
  });

  it('should throw Unauthorized when the session belongs to another user', async () => {
    const command = new RefreshTokenCommand({ userId, deviceId, iat: oldIat });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue({ ...session, userId: 'user-2' });

    const createTokensSpy = jest.spyOn(
      jwtAdapter,
      'createAccessAndRefreshTokens',
    );
    const updateRefreshTokenSpy = jest.spyOn(
      sessionSqlRepository,
      'updateRefreshToken',
    );

    await expect(refreshTokenUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(createTokensSpy).not.toHaveBeenCalled();
    expect(updateRefreshTokenSpy).not.toHaveBeenCalled();
  });

  it('should throw Unauthorized when the refresh token iat is stale', async () => {
    const command = new RefreshTokenCommand({
      userId,
      deviceId,
      iat: oldIat - 1,
    });

    jest
      .spyOn(sessionSqlRepository, 'findActiveByDeviceId')
      .mockResolvedValue(session);

    const createTokensSpy = jest.spyOn(
      jwtAdapter,
      'createAccessAndRefreshTokens',
    );
    const updateRefreshTokenSpy = jest.spyOn(
      sessionSqlRepository,
      'updateRefreshToken',
    );

    await expect(refreshTokenUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Unauthorized,
    });

    expect(createTokensSpy).not.toHaveBeenCalled();
    expect(updateRefreshTokenSpy).not.toHaveBeenCalled();
  });
});

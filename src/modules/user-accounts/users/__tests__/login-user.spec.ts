import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';

import { JwtAdapter } from '../application/services/jwt/jwt.adapter';
import { SessionSqlRepository } from '../infrastructure/session-sql.repository';
import {
  LoginUserCommand,
  LoginUserUseCase,
} from '../application/use-cases/public/login-user.use-case';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let jwtAdapter: JwtAdapter;
  let sessionSqlRepository: SessionSqlRepository;

  const dto = {
    userId: 'user-1',
    deviceName: 'Test device',
    ipAddress: '127.0.0.1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: JwtAdapter,
          useValue: { createAccessAndRefreshTokens: jest.fn() },
        },
        {
          provide: SessionSqlRepository,
          useValue: { createSession: jest.fn() },
        },
      ],
    }).compile();

    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    jwtAdapter = module.get(JwtAdapter);
    sessionSqlRepository = module.get(SessionSqlRepository);
  });

  it('should create a session and return both tokens', async () => {
    const command = new LoginUserCommand(dto);
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    const iat = 1_700_000_000;
    const exp = iat + 120;

    const createTokensSpy = jest
      .spyOn(jwtAdapter, 'createAccessAndRefreshTokens')
      .mockImplementation(async ({ userId, deviceId }) => ({
        accessToken,
        refreshToken,
        payload: { userId, deviceId, iat, exp },
      }));

    const createSessionSpy = jest
      .spyOn(sessionSqlRepository, 'createSession')
      .mockResolvedValue(undefined);

    const result = await loginUserUseCase.execute(command);

    expect(createTokensSpy).toHaveBeenCalledTimes(1);
    expect(createTokensSpy).toHaveBeenCalledWith({
      userId: dto.userId,
      deviceId: expect.any(String),
    });

    // Берём тот deviceId, который use case передал адаптеру.
    const deviceId = createTokensSpy.mock.calls[0]?.[0].deviceId;

    expect(createSessionSpy).toHaveBeenCalledTimes(1);
    expect(createSessionSpy).toHaveBeenCalledWith({
      deviceId,
      userId: dto.userId,
      deviceName: dto.deviceName,
      ip: dto.ipAddress,
      issuedAt: new Date(iat * 1000),
      expirationDate: new Date(exp * 1000),
    });

    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('should not create a session if token generation fails', async () => {
    const command = new LoginUserCommand(dto);
    const error = new Error('Token generation failed');

    jest
      .spyOn(jwtAdapter, 'createAccessAndRefreshTokens')
      .mockRejectedValue(error);

    const createSessionSpy = jest.spyOn(sessionSqlRepository, 'createSession');

    await expect(loginUserUseCase.execute(command)).rejects.toBe(error);

    expect(createSessionSpy).not.toHaveBeenCalled();
  });
});

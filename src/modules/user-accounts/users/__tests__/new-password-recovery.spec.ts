import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PasswordService } from '../application/services/password.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import {
  NewPasswordRecoveryCommand,
  NewPasswordRecoveryUseCase,
} from '../application/use-cases/public/new-password-recovery.use-case';

describe('NewPasswordRecoveryUseCase', () => {
  let newPasswordRecoveryUseCase: NewPasswordRecoveryUseCase;
  let usersSqlRepository: UsersSqlRepository;
  let passwordService: PasswordService;

  const dto = {
    newPassword: 'new-password-123',
    recoveryCode: 'recovery-code-1',
  };

  const accountState = {
    id: 'account-state-1',
    userId: 'user-1',
    confirmationCode: 'confirmation-code-1',
    confirmationExpirationDate: new Date(0),
    isConfirmed: true,
    recoveryCode: dto.recoveryCode,
    recoveryExpirationDate: new Date('2099-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewPasswordRecoveryUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findByRecoveryCode: jest.fn(),
            completePasswordRecovery: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            generateHash: jest.fn(),
          },
        },
      ],
    }).compile();

    newPasswordRecoveryUseCase = module.get<NewPasswordRecoveryUseCase>(
      NewPasswordRecoveryUseCase,
    );
    usersSqlRepository = module.get(UsersSqlRepository);
    passwordService = module.get(PasswordService);
  });

  it('should update the password when the recovery code is valid', async () => {
    const command = new NewPasswordRecoveryCommand(dto);
    const newPasswordHash = 'test-password-hash';

    const findByRecoveryCodeSpy = jest
      .spyOn(usersSqlRepository, 'findByRecoveryCode')
      .mockResolvedValue(accountState);

    const generateHashSpy = jest
      .spyOn(passwordService, 'generateHash')
      .mockResolvedValue(newPasswordHash);

    const completeRecoverySpy = jest
      .spyOn(usersSqlRepository, 'completePasswordRecovery')
      .mockResolvedValue(undefined);

    await newPasswordRecoveryUseCase.execute(command);

    expect(findByRecoveryCodeSpy).toHaveBeenCalledWith(dto.recoveryCode);
    expect(generateHashSpy).toHaveBeenCalledWith(dto.newPassword);
    expect(completeRecoverySpy).toHaveBeenCalledTimes(1);
    expect(completeRecoverySpy).toHaveBeenCalledWith(
      accountState.userId,
      newPasswordHash,
    );
  });

  it('should reject an unknown recovery code', async () => {
    const command = new NewPasswordRecoveryCommand(dto);

    jest
      .spyOn(usersSqlRepository, 'findByRecoveryCode')
      .mockResolvedValue(null);

    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const completeRecoverySpy = jest.spyOn(
      usersSqlRepository,
      'completePasswordRecovery',
    );

    await expect(
      newPasswordRecoveryUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ key: 'recoveryCode' }],
    });

    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(completeRecoverySpy).not.toHaveBeenCalled();
  });

  it('should reject an expired recovery code', async () => {
    const command = new NewPasswordRecoveryCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByRecoveryCode').mockResolvedValue({
      ...accountState,
      recoveryExpirationDate: new Date(0),
    });

    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const completeRecoverySpy = jest.spyOn(
      usersSqlRepository,
      'completePasswordRecovery',
    );

    await expect(
      newPasswordRecoveryUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.PasswordRecoveryCodeExpired,
      extensions: [{ key: 'recoveryCode' }],
    });

    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(completeRecoverySpy).not.toHaveBeenCalled();
  });

  it('should reject a recovery code with no expiration date', async () => {
    const command = new NewPasswordRecoveryCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByRecoveryCode').mockResolvedValue({
      ...accountState,
      recoveryExpirationDate: null,
    });

    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const completeRecoverySpy = jest.spyOn(
      usersSqlRepository,
      'completePasswordRecovery',
    );

    await expect(
      newPasswordRecoveryUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.PasswordRecoveryCodeExpired,
      extensions: [{ key: 'recoveryCode' }],
    });

    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(completeRecoverySpy).not.toHaveBeenCalled();
  });
});

import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../notifications/email.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import {
  PasswordRecoveryCommand,
  PasswordRecoveryUseCase,
} from '../application/use-cases/public/password-recovery.use-case';

describe('PasswordRecoveryUseCase', () => {
  let passwordRecoveryUseCase: PasswordRecoveryUseCase;
  let usersSqlRepository: UsersSqlRepository;
  let emailService: EmailService;

  const user = {
    id: 'user-1',
    login: 'testuser',
    email: 'test@example.com',
    passwordHash: 'test-password-hash',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    deletedAt: null,
    confirmationCode: null,
    confirmationExpirationDate: null,
    isConfirmed: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordRecoveryUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findUserWithEmailConfirmationByEmail: jest.fn(),
            refreshRecoveryCode: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordRecoveryEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    passwordRecoveryUseCase = module.get<PasswordRecoveryUseCase>(
      PasswordRecoveryUseCase,
    );
    usersSqlRepository = module.get(UsersSqlRepository);
    emailService = module.get(EmailService);
  });

  it('should save a recovery code and email it to the confirmed user', async () => {
    const command = new PasswordRecoveryCommand(user.email);

    const findUserSpy = jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue(user);

    const refreshRecoveryCodeSpy = jest
      .spyOn(usersSqlRepository, 'refreshRecoveryCode')
      .mockResolvedValue(undefined);

    const sendEmailSpy = jest
      .spyOn(emailService, 'sendPasswordRecoveryEmail')
      .mockResolvedValue(undefined);

    jest.useFakeTimers({ now: new Date('2026-01-01T12:00:00Z') });
    try {
      await passwordRecoveryUseCase.execute(command);
    } finally {
      jest.useRealTimers();
    }

    expect(findUserSpy).toHaveBeenCalledWith(user.email);
    expect(refreshRecoveryCodeSpy).toHaveBeenCalledTimes(1);

    const recoveryCode = refreshRecoveryCodeSpy.mock.calls[0]?.[1];

    expect(recoveryCode).toEqual(expect.any(String));
    expect(refreshRecoveryCodeSpy).toHaveBeenCalledWith(
      user.id,
      recoveryCode,
      new Date('2026-01-01T13:00:00Z'),
    );

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith(user.email, recoveryCode);
  });

  it('should do nothing when no user is found for the email', async () => {
    const command = new PasswordRecoveryCommand('unknown@example.com');

    jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue(null);

    const refreshRecoveryCodeSpy = jest.spyOn(
      usersSqlRepository,
      'refreshRecoveryCode',
    );
    const sendEmailSpy = jest.spyOn(emailService, 'sendPasswordRecoveryEmail');

    await expect(
      passwordRecoveryUseCase.execute(command),
    ).resolves.toBeUndefined();

    expect(refreshRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject password recovery when the email is not confirmed', async () => {
    const command = new PasswordRecoveryCommand(user.email);

    jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue({ ...user, isConfirmed: false });

    const refreshRecoveryCodeSpy = jest.spyOn(
      usersSqlRepository,
      'refreshRecoveryCode',
    );
    const sendEmailSpy = jest.spyOn(emailService, 'sendPasswordRecoveryEmail');

    await expect(
      passwordRecoveryUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.EmailNotConfirmed,
      extensions: [{ key: 'email' }],
    });

    expect(refreshRecoveryCodeSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });
});

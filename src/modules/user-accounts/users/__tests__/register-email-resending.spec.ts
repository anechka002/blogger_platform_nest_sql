import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../notifications/email.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import {
  RegisterEmailResendingCommand,
  RegisterEmailResendingUseCase,
} from '../application/use-cases/public/register-email-resending.use-case';

describe('RegisterEmailResendingUseCase', () => {
  let registerEmailResendingUseCase: RegisterEmailResendingUseCase;
  let usersSqlRepository: UsersSqlRepository;
  let emailService: EmailService;

  const now = new Date('2026-01-01T12:00:00Z');

  const user = {
    id: 'user-1',
    login: 'testuser',
    email: 'test@example.com',
    passwordHash: 'test-password-hash',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    confirmationCode: 'old-confirmation-code',
    confirmationExpirationDate: new Date('2026-01-01T11:00:00Z'),
    isConfirmed: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterEmailResendingUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findUserWithEmailConfirmationByEmail: jest.fn(),
            refreshEmailConfirmation: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendRegistrationConfirmationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    registerEmailResendingUseCase = module.get<RegisterEmailResendingUseCase>(
      RegisterEmailResendingUseCase,
    );
    usersSqlRepository = module.get(UsersSqlRepository);
    emailService = module.get(EmailService);
  });

  it('should save a new confirmation code and email it to the user', async () => {
    const command = new RegisterEmailResendingCommand(user.email);

    const findUserSpy = jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue(user);

    const refreshConfirmationSpy = jest
      .spyOn(usersSqlRepository, 'refreshEmailConfirmation')
      .mockResolvedValue(undefined);

    const sendEmailSpy = jest
      .spyOn(emailService, 'sendRegistrationConfirmationEmail')
      .mockResolvedValue(undefined);

    jest.useFakeTimers({ now });
    try {
      await registerEmailResendingUseCase.execute(command);
    } finally {
      jest.useRealTimers();
    }

    expect(findUserSpy).toHaveBeenCalledWith(user.email);
    expect(refreshConfirmationSpy).toHaveBeenCalledTimes(1);

    // Второй аргумент вызова репозитория — новый код.
    const newCode = refreshConfirmationSpy.mock.calls[0]?.[1];

    expect(newCode).toEqual(expect.any(String));
    expect(newCode).not.toBe(user.confirmationCode);
    expect(refreshConfirmationSpy).toHaveBeenCalledWith(
      user.id,
      newCode,
      new Date('2026-01-01T13:00:00Z'),
    );

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith(user.email, newCode);
  });

  it('should reject resending when the user or confirmation record is missing', async () => {
    const command = new RegisterEmailResendingCommand('unknown@example.com');

    jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue(null);

    const refreshConfirmationSpy = jest.spyOn(
      usersSqlRepository,
      'refreshEmailConfirmation',
    );
    const sendEmailSpy = jest.spyOn(
      emailService,
      'sendRegistrationConfirmationEmail',
    );

    await expect(
      registerEmailResendingUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      message: 'User or Email confirmation not found',
      extensions: [{ key: 'email' }],
    });

    expect(refreshConfirmationSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject resending when the email is already confirmed', async () => {
    const command = new RegisterEmailResendingCommand(user.email);

    jest
      .spyOn(usersSqlRepository, 'findUserWithEmailConfirmationByEmail')
      .mockResolvedValue({ ...user, isConfirmed: true });

    const refreshConfirmationSpy = jest.spyOn(
      usersSqlRepository,
      'refreshEmailConfirmation',
    );
    const sendEmailSpy = jest.spyOn(
      emailService,
      'sendRegistrationConfirmationEmail',
    );

    await expect(
      registerEmailResendingUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      message: 'Email already confirmed',
      extensions: [{ key: 'email' }],
    });

    expect(refreshConfirmationSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });
});

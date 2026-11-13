import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../notifications/email.service';
import { PasswordService } from '../application/services/password.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import {
  RegisterUserCommand,
  RegisterUserUseCase,
} from '../application/use-cases/public/register-user.use-case';

describe('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;
  let usersSqlRepository: UsersSqlRepository;
  let passwordService: PasswordService;
  let emailService: EmailService;

  const dto = {
    login: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const passwordHash = 'test-password-hash';
  const now = new Date('2026-01-01T12:00:00Z');

  const userRow = {
    id: 'user-1',
    login: dto.login,
    email: dto.email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByLogin: jest.fn(),
            createUserWithAccountState: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: { generateHash: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { sendRegistrationConfirmationEmail: jest.fn() },
        },
      ],
    }).compile();

    registerUserUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    usersSqlRepository = module.get(UsersSqlRepository);
    passwordService = module.get(PasswordService);
    emailService = module.get(EmailService);
  });

  it('should register a user and request a confirmation email', async () => {
    const command = new RegisterUserCommand(dto);

    const findByEmailSpy = jest
      .spyOn(usersSqlRepository, 'findByEmail')
      .mockResolvedValue(null);

    const findByLoginSpy = jest
      .spyOn(usersSqlRepository, 'findByLogin')
      .mockResolvedValue(null);

    const generateHashSpy = jest
      .spyOn(passwordService, 'generateHash')
      .mockResolvedValue(passwordHash);

    const createUserSpy = jest
      .spyOn(usersSqlRepository, 'createUserWithAccountState')
      .mockResolvedValue(userRow);

    const sendEmailSpy = jest
      .spyOn(emailService, 'sendRegistrationConfirmationEmail')
      .mockResolvedValue(undefined);

    jest.useFakeTimers({ now });
    try {
      await registerUserUseCase.execute(command);
    } finally {
      jest.useRealTimers();
    }

    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
    expect(findByLoginSpy).toHaveBeenCalledWith(dto.login);
    expect(generateHashSpy).toHaveBeenCalledWith(dto.password);
    expect(createUserSpy).toHaveBeenCalledTimes(1);

    // Третий аргумент первого вызова — код, который сохранили.
    const confirmationCode = createUserSpy.mock.calls[0]?.[2];

    expect(confirmationCode).toEqual(expect.any(String));
    expect(createUserSpy).toHaveBeenCalledWith(
      { login: dto.login, email: dto.email, passwordHash },
      false,
      confirmationCode,
      new Date('2026-01-01T13:00:00Z'),
    );

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith(dto.email, confirmationCode);
  });

  it('should reject registration when the email is already taken', async () => {
    const command = new RegisterUserCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByEmail').mockResolvedValue(userRow);

    const findByLoginSpy = jest.spyOn(usersSqlRepository, 'findByLogin');
    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const createUserSpy = jest.spyOn(
      usersSqlRepository,
      'createUserWithAccountState',
    );
    const sendEmailSpy = jest.spyOn(
      emailService,
      'sendRegistrationConfirmationEmail',
    );

    await expect(registerUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ key: 'email' }],
    });

    expect(findByLoginSpy).not.toHaveBeenCalled();
    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject registration when the login is already taken', async () => {
    const command = new RegisterUserCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(usersSqlRepository, 'findByLogin').mockResolvedValue(userRow);

    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const createUserSpy = jest.spyOn(
      usersSqlRepository,
      'createUserWithAccountState',
    );
    const sendEmailSpy = jest.spyOn(
      emailService,
      'sendRegistrationConfirmationEmail',
    );

    await expect(registerUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ key: 'login' }],
    });

    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });
});

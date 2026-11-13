import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../application/use-cases/admin/create-user.use-case';
import { PasswordService } from '../application/services/password.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersSqlRepository: UsersSqlRepository;
  let passwordService: PasswordService;

  const dto = {
    login: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const passwordHash = 'test-password-hash';
  const now = new Date();

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
        CreateUserUseCase,
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
          useValue: {
            generateHash: jest.fn(),
          },
        },
      ],
    }).compile();

    createUserUseCase = module.get(CreateUserUseCase);
    usersSqlRepository = module.get(UsersSqlRepository);
    passwordService = module.get(PasswordService);
  });

  it('should create a user with a hashed password and confirmed email', async () => {
    const command = new CreateUserCommand(dto);

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

    const result = await createUserUseCase.execute(command);

    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
    expect(findByLoginSpy).toHaveBeenCalledWith(dto.login);
    expect(generateHashSpy).toHaveBeenCalledWith(dto.password);
    expect(createUserSpy).toHaveBeenCalledTimes(1);
    expect(createUserSpy).toHaveBeenCalledWith(
      { login: dto.login, email: dto.email, passwordHash },
      true,
    );
    expect(result).toBe(userRow.id);
  });

  it('should reject creation when the email is already taken', async () => {
    const command = new CreateUserCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByEmail').mockResolvedValue(userRow);

    const findByLoginSpy = jest.spyOn(usersSqlRepository, 'findByLogin');
    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const createUserSpy = jest.spyOn(
      usersSqlRepository,
      'createUserWithAccountState',
    );

    await expect(createUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ key: 'email' }],
    });

    expect(findByLoginSpy).not.toHaveBeenCalled();
    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });

  it('should reject creation when the login is already taken', async () => {
    const command = new CreateUserCommand(dto);

    jest.spyOn(usersSqlRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(usersSqlRepository, 'findByLogin').mockResolvedValue(userRow);

    const generateHashSpy = jest.spyOn(passwordService, 'generateHash');
    const createUserSpy = jest.spyOn(
      usersSqlRepository,
      'createUserWithAccountState',
    );

    await expect(createUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      extensions: [{ key: 'login' }],
    });

    expect(generateHashSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
});

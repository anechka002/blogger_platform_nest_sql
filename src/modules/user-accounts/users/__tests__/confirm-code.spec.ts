import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import {
  ConfirmCodeCommand,
  ConfirmCodeUseCase,
} from '../application/use-cases/public/confirm-code.use-case';

describe('ConfirmCodeUseCase', () => {
  let confirmCodeUseCase: ConfirmCodeUseCase;
  let usersSqlRepository: UsersSqlRepository;

  const code = 'confirmation-code-1';
  const oneHour = 60 * 60 * 1000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmCodeUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findByConfirmationCode: jest.fn(),
            confirmEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    confirmCodeUseCase = module.get(ConfirmCodeUseCase);
    usersSqlRepository = module.get(UsersSqlRepository);
  });

  it('should confirm email when the code is valid', async () => {
    const command = new ConfirmCodeCommand(code);

    const findConfirmationSpy = jest
      .spyOn(usersSqlRepository, 'findByConfirmationCode')
      .mockResolvedValue({
        userId: 'user-1',
        confirmationCode: code,
        isConfirmed: false,
        confirmationExpirationDate: new Date(Date.now() + oneHour),
      });

    const confirmEmailSpy = jest.spyOn(usersSqlRepository, 'confirmEmail');

    await confirmCodeUseCase.execute(command);

    expect(findConfirmationSpy).toHaveBeenCalledWith(code);
    expect(confirmEmailSpy).toHaveBeenCalledTimes(1);
    expect(confirmEmailSpy).toHaveBeenCalledWith(code);
  });

  it('should reject an unknown confirmation code', async () => {
    const command = new ConfirmCodeCommand(code);

    jest
      .spyOn(usersSqlRepository, 'findByConfirmationCode')
      .mockResolvedValue(null);

    const confirmEmailSpy = jest.spyOn(usersSqlRepository, 'confirmEmail');

    await expect(confirmCodeUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      message: 'Invalid confirmation code',
      extensions: [{ key: 'code' }],
    });

    expect(confirmEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject confirmation when the email is already confirmed', async () => {
    const command = new ConfirmCodeCommand(code);

    jest.spyOn(usersSqlRepository, 'findByConfirmationCode').mockResolvedValue({
      userId: 'user-1',
      confirmationCode: code,
      isConfirmed: true,
      confirmationExpirationDate: new Date(Date.now() + oneHour),
    });

    const confirmEmailSpy = jest.spyOn(usersSqlRepository, 'confirmEmail');

    await expect(confirmCodeUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
      message: 'Email is already confirmed',
      extensions: [{ key: 'code' }],
    });

    expect(confirmEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject confirmation when the code has expired', async () => {
    const command = new ConfirmCodeCommand(code);

    jest.spyOn(usersSqlRepository, 'findByConfirmationCode').mockResolvedValue({
      userId: 'user-1',
      confirmationCode: code,
      isConfirmed: false,
      confirmationExpirationDate: new Date(0),
    });

    const confirmEmailSpy = jest.spyOn(usersSqlRepository, 'confirmEmail');

    await expect(confirmCodeUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.ConfirmationCodeExpired,
      extensions: [{ key: 'code' }],
    });

    expect(confirmEmailSpy).not.toHaveBeenCalled();
  });

  it('should reject confirmation when the expiration date is missing', async () => {
    const command = new ConfirmCodeCommand(code);

    jest.spyOn(usersSqlRepository, 'findByConfirmationCode').mockResolvedValue({
      userId: 'user-1',
      confirmationCode: code,
      isConfirmed: false,
      confirmationExpirationDate: null,
    });

    const confirmEmailSpy = jest.spyOn(usersSqlRepository, 'confirmEmail');

    await expect(confirmCodeUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.ConfirmationCodeExpired,
      extensions: [{ key: 'code' }],
    });

    expect(confirmEmailSpy).not.toHaveBeenCalled();
  });
});

import { Test, type TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  DeleteUserCommand,
  DeleteUserUseCase,
} from '../application/use-cases/admin/delete-user.use-case';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let usersSqlRepository: UsersSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UsersSqlRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    deleteUserUseCase = module.get(DeleteUserUseCase);
    usersSqlRepository = module.get(UsersSqlRepository);
  });

  it('should delete an existing user', async () => {
    const userId = 'user-1';
    const command = new DeleteUserCommand(userId);
    const now = new Date();

    const findUserSpy = jest
      .spyOn(usersSqlRepository, 'findById')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        passwordHash: 'test-password-hash',
        createdAt: now,
      });

    const deleteUserSpy = jest
      .spyOn(usersSqlRepository, 'delete')
      .mockResolvedValue(undefined);

    await deleteUserUseCase.execute(command);

    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(deleteUserSpy).toHaveBeenCalledTimes(1);
    expect(deleteUserSpy).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFound and not delete if the user does not exist', async () => {
    const userId = 'user-1';
    const command = new DeleteUserCommand(userId);

    const findUserSpy = jest
      .spyOn(usersSqlRepository, 'findById')
      .mockResolvedValue(null);

    const deleteUserSpy = jest.spyOn(usersSqlRepository, 'delete');

    await expect(deleteUserUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });

    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(deleteUserSpy).not.toHaveBeenCalled();
  });
});

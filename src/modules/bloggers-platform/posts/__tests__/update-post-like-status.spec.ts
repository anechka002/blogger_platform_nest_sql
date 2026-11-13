import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import {
  UpdatePostLikeStatusCommand,
  UpdatePostLikeStatusUseCase,
} from '../application/use-cases/update-post-like-status.use-case';
import { PostsSqlRepository } from '../infrastructure/posts-sql.repository';
import { PostLikesSqlRepository } from '../infrastructure/post-like-sql.repository';
import { UsersExternalQueryRepository } from '../../../user-accounts/users/infrastructure/external-query/users.external-query-repository';
import { LikeStatusDto } from '../../../../core/dto/like-status.dto';
import { LikeStatus } from '../../../../core/enum/like-status';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

describe('UpdatePostLikeStatusUseCase', () => {
  let updatePostLikeStatusUseCase: UpdatePostLikeStatusUseCase;
  let postsSqlRepository: PostsSqlRepository;
  let postLikesSqlRepository: PostLikesSqlRepository;
  let usersExternalQueryRepository: UsersExternalQueryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        UpdatePostLikeStatusUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: PostsSqlRepository,
          useValue: {
            findOrNotFoundFail: jest.fn(), // создание заглушки
          },
        },
        {
          provide: UsersExternalQueryRepository,
          useValue: {
            getByIdOrNotFoundFail: jest.fn(), // создание заглушки
          },
        },
        {
          provide: PostLikesSqlRepository,
          useValue: {
            findReaction: jest.fn(), // создание заглушки
            createReaction: jest.fn(), // создание заглушки
            deleteReaction: jest.fn(), // создание заглушки
            updateReaction: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    updatePostLikeStatusUseCase = module.get<UpdatePostLikeStatusUseCase>(
      UpdatePostLikeStatusUseCase,
    );
    postsSqlRepository = module.get<PostsSqlRepository>(PostsSqlRepository);
    postLikesSqlRepository = module.get<PostLikesSqlRepository>(
      PostLikesSqlRepository,
    );
    usersExternalQueryRepository = module.get<UsersExternalQueryRepository>(
      UsersExternalQueryRepository,
    );
  });

  it('should create a Like reaction when the user has no reaction yet', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        isEmailConfirmed: true,
      });

    const findReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'findReaction')
      .mockResolvedValue(null);

    const createReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'createReaction')
      .mockResolvedValue(undefined);

    const result = await updatePostLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ postId, userId });
    expect(createReactionSpy).toHaveBeenCalledTimes(1);
    expect(createReactionSpy).toHaveBeenCalledWith({
      postId,
      userId,
      status: LikeStatus.Like,
    });
  });

  it('should update an existing Like reaction to Dislike', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Dislike };
    const postLikeId = 'postLikeId-1';

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        isEmailConfirmed: true,
      });

    const findReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        postId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'updateReaction')
      .mockResolvedValue(undefined);

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updatePostLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ postId, userId });
    expect(updateReactionSpy).toHaveBeenCalledTimes(1);
    expect(updateReactionSpy).toHaveBeenCalledWith({
      postId,
      userId,
      status: LikeStatus.Dislike,
    });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('should delete an existing Like reaction when the new status is None', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.None };
    const postLikeId = 'postLikeId-1';

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        isEmailConfirmed: true,
      });

    const findReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        postId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updatePostLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ postId, userId });
    expect(deleteReactionSpy).toHaveBeenCalledTimes(1);
    expect(deleteReactionSpy).toHaveBeenCalledWith({
      postId,
      userId,
    });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
  });

  it('should not change the reaction when the status is already Like', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };
    const postLikeId = 'postLikeId-1';

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        isEmailConfirmed: true,
      });

    const findReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        postId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updatePostLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ postId, userId });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('should do nothing when no reaction exists and the requested status is None', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.None };

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: userId,
        login: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        isEmailConfirmed: true,
      });

    const findReactionSpy = jest
      .spyOn(postLikesSqlRepository, 'findReaction')
      .mockResolvedValue(null);

    const updateReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updatePostLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ postId, userId });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('should throw NotFound and not change the reaction when the post does not exist', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Post Not Found',
    });

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const findUserSpy = jest.spyOn(
      usersExternalQueryRepository,
      'getByIdOrNotFoundFail',
    );

    const findReactionSpy = jest.spyOn(postLikesSqlRepository, 'findReaction');

    const updateReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    await expect(updatePostLikeStatusUseCase.execute(command)).rejects.toBe(
      error,
    );

    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).not.toHaveBeenCalled();
    expect(findReactionSpy).not.toHaveBeenCalled();
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('should throw NotFound and not change the reaction when the user does not exist', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const blogId = 'blogId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'User Not Found',
    });

    const command = new UpdatePostLikeStatusCommand(userId, postId, dto);

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Test post description',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findUserSpy = jest
      .spyOn(usersExternalQueryRepository, 'getByIdOrNotFoundFail')
      .mockRejectedValue(error);

    const findReactionSpy = jest.spyOn(postLikesSqlRepository, 'findReaction');

    const updateReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      postLikesSqlRepository,
      'deleteReaction',
    );

    await expect(updatePostLikeStatusUseCase.execute(command)).rejects.toBe(
      error,
    );

    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(findUserSpy).toHaveBeenCalledTimes(1);
    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findReactionSpy).not.toHaveBeenCalled();
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });
});

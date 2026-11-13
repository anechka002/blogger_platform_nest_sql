import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { LikeStatusDto } from '../../../../core/dto/like-status.dto';
import { LikeStatus } from '../../../../core/enum/like-status';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  UpdateLikeStatusCommand,
  UpdateLikeStatusUseCase,
} from '../application/use-cases/update-like-status.use-case';
import { CommentLikesSqlRepository } from '../infrastructure/comment-like-sql.repository';
import { CommentsSqlRepository } from '../infrastructure/comments-sql.repository';

describe('UpdateLikeStatusUseCase', () => {
  let updateLikeStatusUseCase: UpdateLikeStatusUseCase;
  let commentsSqlRepository: CommentsSqlRepository;
  let commentLikesSqlRepository: CommentLikesSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        UpdateLikeStatusUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: CommentsSqlRepository,
          useValue: {
            findById: jest.fn(), // создание заглушки
          },
        },
        {
          provide: CommentLikesSqlRepository,
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
    updateLikeStatusUseCase = module.get<UpdateLikeStatusUseCase>(
      UpdateLikeStatusUseCase,
    );
    commentsSqlRepository = module.get<CommentsSqlRepository>(
      CommentsSqlRepository,
    );
    commentLikesSqlRepository = module.get<CommentLikesSqlRepository>(
      CommentLikesSqlRepository,
    );
  });

  it('None → Like, should create a Like reaction when the user has no reaction yet', async () => {
    const userId = 'userId-1';
    const commentId = 'commentId-1';
    const postId = 'postId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment content',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'findReaction')
      .mockResolvedValue(null);

    const createReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'createReaction')
      .mockResolvedValue(undefined);

    const result = await updateLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findCommentSpy).toHaveBeenCalledTimes(1);
    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ commentId, userId });
    expect(createReactionSpy).toHaveBeenCalledTimes(1);
    expect(createReactionSpy).toHaveBeenCalledWith({
      commentId,
      userId,
      status: LikeStatus.Like,
    });
  });

  it('Like → Dislike, should update an existing Like reaction to Dislike', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const commentId = 'commentId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Dislike };
    const postLikeId = 'postLikeId-1';

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment content',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        commentId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'updateReaction')
      .mockResolvedValue(undefined);

    const createReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updateLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findCommentSpy).toHaveBeenCalledTimes(1);
    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ commentId, userId });
    expect(updateReactionSpy).toHaveBeenCalledTimes(1);
    expect(updateReactionSpy).toHaveBeenCalledWith({
      commentId,
      userId,
      status: LikeStatus.Dislike,
    });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('Like → None, should delete an existing Like reaction when the new status is None', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const commentId = 'commentId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.None };
    const postLikeId = 'postLikeId-1';

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment content',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        commentId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updateLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findCommentSpy).toHaveBeenCalledTimes(1);
    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ commentId, userId });
    expect(deleteReactionSpy).toHaveBeenCalledTimes(1);
    expect(deleteReactionSpy).toHaveBeenCalledWith({
      commentId,
      userId,
    });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
  });

  it('Like → Like, should not change the reaction when the status is already Like', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const commentId = 'commentId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };
    const postLikeId = 'postLikeId-1';

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment content',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'findReaction')
      .mockResolvedValue({
        id: postLikeId,
        commentId,
        userId,
        status: LikeStatus.Like,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updateLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findCommentSpy).toHaveBeenCalledTimes(1);
    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ commentId, userId });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('None → None, should do nothing when no reaction exists and the requested status is None', async () => {
    const userId = 'userId-1';
    const postId = 'postId-1';
    const commentId = 'commentId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.None };

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment content',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const findReactionSpy = jest
      .spyOn(commentLikesSqlRepository, 'findReaction')
      .mockResolvedValue(null);

    const updateReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'deleteReaction',
    );

    const result = await updateLikeStatusUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findCommentSpy).toHaveBeenCalledTimes(1);
    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).toHaveBeenCalledTimes(1);
    expect(findReactionSpy).toHaveBeenCalledWith({ commentId, userId });
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });

  it('Комментарий не найден, should throw NotFound and not change the reaction when the comment does not exist', async () => {
    const userId = 'userId-1';
    const commentId = 'commentId-1';
    const dto: LikeStatusDto = { likeStatus: LikeStatus.Like };

    const command = new UpdateLikeStatusCommand(userId, commentId, dto);

    const findCommentSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue(null);

    const findReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'findReaction',
    );

    const updateReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'updateReaction',
    );

    const createReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'createReaction',
    );
    const deleteReactionSpy = jest.spyOn(
      commentLikesSqlRepository,
      'deleteReaction',
    );

    await expect(
      updateLikeStatusUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });

    expect(findCommentSpy).toHaveBeenCalledWith(commentId);
    expect(findReactionSpy).not.toHaveBeenCalled();
    expect(createReactionSpy).not.toHaveBeenCalled();
    expect(updateReactionSpy).not.toHaveBeenCalled();
    expect(deleteReactionSpy).not.toHaveBeenCalled();
  });
});

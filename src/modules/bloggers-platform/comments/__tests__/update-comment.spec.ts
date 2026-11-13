import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../infrastructure/comments-sql.repository';
import {
  UpdateCommentCommand,
  UpdateCommentUseCase,
} from '../application/use-cases/update-comment.use-case';

describe('UpdateCommentUseCase', () => {
  let updateCommentUseCase: UpdateCommentUseCase;
  let commentsSqlRepository: CommentsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        UpdateCommentUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: CommentsSqlRepository,
          useValue: {
            findById: jest.fn(),
            updateComment: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    updateCommentUseCase =
      module.get<UpdateCommentUseCase>(UpdateCommentUseCase);
    commentsSqlRepository = module.get<CommentsSqlRepository>(
      CommentsSqlRepository,
    );
  });

  it('should update a comment', async () => {
    const commentId = 'commentId-1';
    const postId = 'postId-1';
    const userId = 'userId-1';
    const dto = { content: 'bla' };

    const command = new UpdateCommentCommand(userId, commentId, dto);

    const findSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockResolvedValue({
        id: commentId,
        content: 'Test comment',
        postId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const updateSpy = jest
      .spyOn(commentsSqlRepository, 'updateComment')
      .mockResolvedValue(undefined);

    const result = await updateCommentUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(command.commentId);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(commentId, dto.content);
  });

  it('should throw NotFound and not update if the comment does not exist', async () => {
    const commentId = 'commentId-1';
    const userId = 'userId-1';
    const dto = { content: 'bla' };

    const command = new UpdateCommentCommand(userId, commentId, dto);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockRejectedValue(error);

    const updateSpy = jest.spyOn(commentsSqlRepository, 'updateComment');

    await expect(updateCommentUseCase.execute(command)).rejects.toBe(error);

    expect(findSpy).toHaveBeenCalledWith(commentId);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should throw Forbidden and not update a comment owned by another user', async () => {
    const commentId = 'comment-1';
    const ownerId = 'user-1';
    const requesterId = 'user-2';
    const content = 'test content';

    jest.spyOn(commentsSqlRepository, 'findById').mockResolvedValue({
      id: commentId,
      postId: 'post-1',
      userId: ownerId,
      content: 'Test comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updateSpy = jest.spyOn(commentsSqlRepository, 'updateComment');

    const command = new UpdateCommentCommand(requesterId, commentId, {
      content,
    });

    await expect(updateCommentUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Forbidden,
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });
});

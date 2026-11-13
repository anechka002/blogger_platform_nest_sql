import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  DeleteCommentCommand,
  DeleteCommentUseCase,
} from '../application/use-cases/delete-comment.use-case';
import { CommentsSqlRepository } from '../infrastructure/comments-sql.repository';

describe('DeleteCommentUseCase', () => {
  let deleteCommentUseCase: DeleteCommentUseCase;
  let commentsSqlRepository: CommentsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        DeleteCommentUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: CommentsSqlRepository,
          useValue: {
            findById: jest.fn(),
            deleteComment: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    deleteCommentUseCase =
      module.get<DeleteCommentUseCase>(DeleteCommentUseCase);
    commentsSqlRepository = module.get<CommentsSqlRepository>(
      CommentsSqlRepository,
    );
  });

  it('should delete a comment', async () => {
    const commentId = 'commentId-1';
    const postId = 'postId-1';
    const userId = 'userId-1';

    const command = new DeleteCommentCommand(userId, commentId);

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

    const deleteSpy = jest
      .spyOn(commentsSqlRepository, 'deleteComment')
      .mockResolvedValue(undefined);

    const result = await deleteCommentUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(command.commentId);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(commentId);
  });

  it('should throw NotFound and not delete if the comment does not exist', async () => {
    const commentId = 'commentId-1';
    const userId = 'userId-1';

    const command = new DeleteCommentCommand(userId, commentId);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findSpy = jest
      .spyOn(commentsSqlRepository, 'findById')
      .mockRejectedValue(error);

    const deleteSpy = jest.spyOn(commentsSqlRepository, 'deleteComment');

    await expect(deleteCommentUseCase.execute(command)).rejects.toBe(error);

    expect(findSpy).toHaveBeenCalledWith(commentId);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('should throw Forbidden and not delete a comment owned by another user', async () => {
    const commentId = 'comment-1';
    const ownerId = 'user-1';
    const requesterId = 'user-2';

    jest.spyOn(commentsSqlRepository, 'findById').mockResolvedValue({
      id: commentId,
      postId: 'post-1',
      userId: ownerId,
      content: 'Test comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const deleteSpy = jest.spyOn(commentsSqlRepository, 'deleteComment');

    const command = new DeleteCommentCommand(requesterId, commentId);

    await expect(deleteCommentUseCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Forbidden,
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

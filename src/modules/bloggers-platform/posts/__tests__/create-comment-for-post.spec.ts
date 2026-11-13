import { Test, TestingModule } from '@nestjs/testing';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  CreateCommentForPostCommand,
  CreateCommentForPostUseCase,
} from '../application/use-cases/create-comment-for-post.use-case';
import { PostsSqlQueryRepository } from '../infrastructure/query/posts-sql.query-repository';
import { CommentsSqlRepository } from '../../comments/infrastructure/comments-sql.repository';
import { UsersExternalQueryRepository } from '../../../user-accounts/users/infrastructure/external-query/users.external-query-repository';
import { LikeStatus } from '../../../../core/enum/like-status';

describe('CreateCommentForPostUseCase', () => {
  let createCommentForPostUseCase: CreateCommentForPostUseCase;
  let postsSqlQueryRepository: PostsSqlQueryRepository;
  let commentsSqlRepository: CommentsSqlRepository;
  let usersExternalQueryRepository: UsersExternalQueryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        CreateCommentForPostUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: CommentsSqlRepository,
          useValue: {
            createComment: jest.fn(),
          },
        },
        {
          provide: PostsSqlQueryRepository,
          useValue: {
            getByIdOrNotFoundFail: jest.fn(), // создание заглушки
          },
        },
        {
          provide: UsersExternalQueryRepository,
          useValue: {
            getByIdOrNotFoundFail: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    createCommentForPostUseCase = module.get<CreateCommentForPostUseCase>(
      CreateCommentForPostUseCase,
    );
    // заглушку репозитория блогов;
    commentsSqlRepository = module.get<CommentsSqlRepository>(
      CommentsSqlRepository,
    );
    usersExternalQueryRepository = module.get<UsersExternalQueryRepository>(
      UsersExternalQueryRepository,
    );
    postsSqlQueryRepository = module.get<PostsSqlQueryRepository>(
      PostsSqlQueryRepository,
    );
  });

  it('should create a comment for an existing post', async () => {
    const userId = 'userId-1';
    const postId = 'post-1';
    const commentId = 'commentId-1';
    const content = 'Comment content';

    const command = new CreateCommentForPostCommand(userId, postId, {
      content,
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

    const findPostSpy = jest
      .spyOn(postsSqlQueryRepository, 'getByIdOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: 'blog-1',
        blogName: 'Test blog',
        title: 'Test post',
        shortDescription: 'Post description',
        content: 'Post content',
        createdAt: new Date(),
        updatedAt: new Date(),
        myStatus: LikeStatus.None,
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      });

    const createCommentSpy = jest
      .spyOn(commentsSqlRepository, 'createComment')
      .mockResolvedValue(commentId);

    const result = await createCommentForPostUseCase.execute(command);

    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(createCommentSpy).toHaveBeenCalledTimes(1);
    expect(createCommentSpy).toHaveBeenCalledWith({
      userId,
      postId,
      content,
    });
    expect(result).toBe(commentId);
  });

  it('should throw NotFound and not create a comment if the post does not exist', async () => {
    const userId = 'userId-1';
    const postId = 'post-1';
    const content = 'Comment content';

    const command = new CreateCommentForPostCommand(userId, postId, {
      content,
    });

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Post Not Found',
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

    const findPostSpy = jest
      .spyOn(postsSqlQueryRepository, 'getByIdOrNotFoundFail')
      .mockRejectedValue(error);

    const createCommentSpy = jest.spyOn(commentsSqlRepository, 'createComment');

    await expect(createCommentForPostUseCase.execute(command)).rejects.toBe(
      error,
    );

    expect(findUserSpy).toHaveBeenCalledWith(userId);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(createCommentSpy).not.toHaveBeenCalled();
  });
});

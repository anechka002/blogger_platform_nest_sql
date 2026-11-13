import { Test, TestingModule } from '@nestjs/testing';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostsSqlRepository } from '../../posts/infrastructure/posts-sql.repository';
import {
  DeletePostForBlogCommand,
  DeletePostForBlogUseCase,
} from '../application/use-cases/delete-post-for-blog.use-case';

describe('DeletePostForBlogUseCase', () => {
  let deletePostForBlogUseCase: DeletePostForBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;
  let postsSqlRepository: PostsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        DeletePostForBlogUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: BlogsSqlRepository,
          useValue: {
            findOrNotFoundFail: jest.fn(),
          },
        },
        {
          provide: PostsSqlRepository,
          useValue: {
            findOrNotFoundFail: jest.fn(),
            deletePostForBlog: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    deletePostForBlogUseCase = module.get<DeletePostForBlogUseCase>(
      DeletePostForBlogUseCase,
    );
    // заглушка репозитория блогов;
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
    // заглушка репозитория постов.
    postsSqlRepository = module.get(PostsSqlRepository);
  });

  it('should delete a post for an existing blog', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const command = new DeletePostForBlogCommand(blogId, postId);

    const findBlogSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: blogId,
        name: 'Test blog',
        description: 'Blog description',
        websiteUrl: 'https://test.blog',
        isMembership: false,
        createdAt: new Date(),
      });

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: blogId,
        title: 'Test post',
        shortDescription: 'Post description',
        content: 'Post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const deletePostForBlogSpy = jest
      .spyOn(postsSqlRepository, 'deletePostForBlog')
      .mockResolvedValue(undefined);

    const result = await deletePostForBlogUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(command.postId);
    expect(deletePostForBlogSpy).toHaveBeenCalledTimes(1);
    expect(deletePostForBlogSpy).toHaveBeenCalledWith(blogId, postId);
  });

  it('should throw NotFound and not delete a post if the blog does not exist', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const command = new DeletePostForBlogCommand(blogId, postId);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findBlogSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const findPostSpy = jest.spyOn(postsSqlRepository, 'findOrNotFoundFail');

    const deletePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'deletePostForBlog',
    );

    await expect(deletePostForBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findBlogSpy).toHaveBeenCalledWith(blogId);
    expect(findPostSpy).not.toHaveBeenCalled();
    expect(deletePostForBlogSpy).not.toHaveBeenCalled();
  });

  it('the blog was found, but the post was not found', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const command = new DeletePostForBlogCommand(blogId, postId);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Post Not Found',
    });

    const findBlogSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: blogId,
        name: 'Test blog',
        description: 'Blog description',
        websiteUrl: 'https://test.blog',
        isMembership: false,
        createdAt: new Date(),
      });

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const deletePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'deletePostForBlog',
    );

    await expect(deletePostForBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(deletePostForBlogSpy).not.toHaveBeenCalled();
  });

  it('should throw Not Found and not delete the post if it belongs to a different blog', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const command = new DeletePostForBlogCommand(blogId, postId);

    const findBlogSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: blogId,
        name: 'Test blog',
        description: 'Blog description',
        websiteUrl: 'https://test.blog',
        isMembership: false,
        createdAt: new Date(),
      });

    const findPostSpy = jest
      .spyOn(postsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: postId,
        blogId: 'blog-2',
        title: 'Test post',
        shortDescription: 'Post description',
        content: 'Post content',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const deletePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'deletePostForBlog',
    );

    await expect(
      deletePostForBlogUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
      message: 'Post not found in this blog',
    });

    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(command.postId);
    expect(deletePostForBlogSpy).not.toHaveBeenCalled();
  });
});

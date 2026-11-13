import { Test, TestingModule } from '@nestjs/testing';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostsSqlRepository } from '../../posts/infrastructure/posts-sql.repository';
import {
  UpdatePostForBlogCommand,
  UpdatePostForBlogUseCase,
} from '../application/use-cases/update-post-for-blog.use-case';
import { UpdatePostForBlogDto } from '../dto/create-post-for-blog.dto';

describe('UpdatePostForBlogUseCase', () => {
  let updatePostForBlogUseCase: UpdatePostForBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;
  let postsSqlRepository: PostsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        UpdatePostForBlogUseCase,

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
            updatePostForBlog: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    updatePostForBlogUseCase = module.get<UpdatePostForBlogUseCase>(
      UpdatePostForBlogUseCase,
    );
    // заглушка репозитория блогов;
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
    // заглушка репозитория постов.
    postsSqlRepository = module.get(PostsSqlRepository);
  });

  it('should update a post for an existing blog', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const body: UpdatePostForBlogDto = {
      title: 'Update post',
      shortDescription: 'Post description',
      content: 'Post content',
    };

    const command = new UpdatePostForBlogCommand(blogId, postId, body);

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

    const updatePostForBlogSpy = jest
      .spyOn(postsSqlRepository, 'updatePostForBlog')
      .mockResolvedValue(undefined);

    const result = await updatePostForBlogUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(command.postId);
    expect(updatePostForBlogSpy).toHaveBeenCalledTimes(1);
    expect(updatePostForBlogSpy).toHaveBeenCalledWith(blogId, postId, body);
  });

  it('should throw NotFound and not update a post if the blog does not exist', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const body: UpdatePostForBlogDto = {
      title: 'Update post',
      shortDescription: 'Post description',
      content: 'Post content',
    };

    const command = new UpdatePostForBlogCommand(blogId, postId, body);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findBlogSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const findPostSpy = jest.spyOn(postsSqlRepository, 'findOrNotFoundFail');

    const updatePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'updatePostForBlog',
    );

    await expect(updatePostForBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findBlogSpy).toHaveBeenCalledWith(blogId);
    expect(findPostSpy).not.toHaveBeenCalled();
    expect(updatePostForBlogSpy).not.toHaveBeenCalled();
  });

  it('the blog was found, but the post was not found', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const body: UpdatePostForBlogDto = {
      title: 'Update post',
      shortDescription: 'Post description',
      content: 'Post content',
    };

    const command = new UpdatePostForBlogCommand(blogId, postId, body);

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

    const updatePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'updatePostForBlog',
    );

    await expect(updatePostForBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledWith(postId);
    expect(updatePostForBlogSpy).not.toHaveBeenCalled();
  });

  it('should throw Not Found and not update the post if it belongs to a different blog', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const body: UpdatePostForBlogDto = {
      title: 'Update post',
      shortDescription: 'Post description',
      content: 'Post content',
    };

    const command = new UpdatePostForBlogCommand(blogId, postId, body);

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

    const updatePostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'updatePostForBlog',
    );

    await expect(
      updatePostForBlogUseCase.execute(command),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
      message: 'Post not found in this blog',
    });

    expect(findBlogSpy).toHaveBeenCalledTimes(1);
    expect(findBlogSpy).toHaveBeenCalledWith(command.blogId);
    expect(findPostSpy).toHaveBeenCalledTimes(1);
    expect(findPostSpy).toHaveBeenCalledWith(command.postId);
    expect(updatePostForBlogSpy).not.toHaveBeenCalled();
  });
});

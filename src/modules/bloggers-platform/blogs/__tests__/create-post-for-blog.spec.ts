import { Test, TestingModule } from '@nestjs/testing';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostsSqlRepository } from '../../posts/infrastructure/posts-sql.repository';
import {
  CreatePostForBlogCommand,
  CreatePostForBlogUseCase,
} from '../application/use-cases/create-post-for-blog.use-case';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';

describe('CreatePostForBlogUseCase', () => {
  let createPostForBlogUseCase: CreatePostForBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;
  let postsSqlRepository: PostsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        CreatePostForBlogUseCase,

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
            createPostForBlog: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    // настоящий экземпляр use case;
    createPostForBlogUseCase = module.get<CreatePostForBlogUseCase>(
      CreatePostForBlogUseCase,
    );
    // заглушку репозитория блогов;
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
    // заглушку репозитория постов.
    postsSqlRepository = module.get(PostsSqlRepository);
  });

  it('should create a post for an existing blog', async () => {
    const blogId = 'blog-1';
    const postId = 'post-1';

    const body: CreatePostForBlogDto = {
      title: 'Create post',
      shortDescription: 'Post description',
      content: 'Post content',
    };

    const command = new CreatePostForBlogCommand(blogId, body);

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id: blogId,
        name: 'Test blog',
        description: 'Blog description',
        websiteUrl: 'https://test.blog',
        isMembership: false,
        createdAt: new Date(),
      });

    const createPostForBlogSpy = jest
      .spyOn(postsSqlRepository, 'createPostForBlog')
      .mockResolvedValue(postId);

    const result = await createPostForBlogUseCase.execute(command);

    expect(result).toBe(postId);
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(command.blogId);
    expect(createPostForBlogSpy).toHaveBeenCalledTimes(1);
    expect(createPostForBlogSpy).toHaveBeenCalledWith(blogId, body);
  });

  it('should throw NotFound and not create a post if the blog does not exist', async () => {
    const blogId = 'blog-1';

    const body: CreatePostForBlogDto = {
      title: 'Create post',
      shortDescription: 'Post description',
      content: 'Post content',
    };
    const command = new CreatePostForBlogCommand(blogId, body);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const createPostForBlogSpy = jest.spyOn(
      postsSqlRepository,
      'createPostForBlog',
    );

    await expect(createPostForBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findSpy).toHaveBeenCalledWith(blogId);
    expect(createPostForBlogSpy).not.toHaveBeenCalled();
  });
});

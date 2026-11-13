import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateBlogCommand,
  CreateBlogUseCase,
} from '../application/use-cases/create-blog.use-case';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { jest } from '@jest/globals';

describe('CreateBlogUseCase', () => {
  let createBlogUseCase: CreateBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        CreateBlogUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: BlogsSqlRepository,
          useValue: {
            create: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    createBlogUseCase = module.get<CreateBlogUseCase>(CreateBlogUseCase);
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
  });

  it('should create a blog', async () => {
    const name = 'Test blog';
    const description = 'Test description';
    const websiteUrl = 'https://test.bloggers.com/blogs/';

    const command = new CreateBlogCommand({
      name,
      description,
      websiteUrl,
    });

    const expectedId = '1';

    const createSpy = jest
      .spyOn(blogsSqlRepository, 'create')
      .mockResolvedValue(expectedId);

    const result = await createBlogUseCase.execute(command);

    expect(result).toBe(expectedId);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(command.dto);
  });
});

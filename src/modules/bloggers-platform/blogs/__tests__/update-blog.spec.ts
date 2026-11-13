import { Test, TestingModule } from '@nestjs/testing';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { expect, jest } from '@jest/globals';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  UpdateBlogCommand,
  UpdateBlogUseCase,
} from '../application/use-cases/update-blog.use-case';
import { UpdateBlogDto } from '../dto/create-blog.dto';

describe('UpdateBlogUseCase', () => {
  let updateBlogUseCase: UpdateBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        UpdateBlogUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: BlogsSqlRepository,
          useValue: {
            findOrNotFoundFail: jest.fn(),
            update: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    updateBlogUseCase = module.get<UpdateBlogUseCase>(UpdateBlogUseCase);
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
  });

  it('should update a blog', async () => {
    const id = '1';

    const dto: UpdateBlogDto = {
      name: 'Updated blog',
      description: 'Updated description',
      websiteUrl: 'https://updated.blog',
    };

    const command = new UpdateBlogCommand(id, dto);

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id,
        name: 'Original blog',
        description: 'Original description',
        websiteUrl: 'https://original.blog',
        isMembership: false,
        createdAt: new Date(),
      });

    const updateSpy = jest
      .spyOn(blogsSqlRepository, 'update')
      .mockResolvedValue(undefined);

    const result = await updateBlogUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(command.id);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(id, dto);
  });

  it('should throw NotFound and not update if the blog does not exist', async () => {
    const id = '1';
    const dto: UpdateBlogDto = {
      name: 'Updated blog',
      description: 'Updated description',
      websiteUrl: 'https://updated.blog',
    };
    const command = new UpdateBlogCommand(id, dto);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const updateSpy = jest.spyOn(blogsSqlRepository, 'update');

    await expect(updateBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findSpy).toHaveBeenCalledWith(id);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

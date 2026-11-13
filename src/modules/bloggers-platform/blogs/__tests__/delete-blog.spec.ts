import { Test, TestingModule } from '@nestjs/testing';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { expect, jest } from '@jest/globals';
import {
  DeleteBlogCommand,
  DeleteBlogUseCase,
} from '../application/use-cases/delete-blog.use-case';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

describe('DeleteBlogUseCase', () => {
  let deleteBlogUseCase: DeleteBlogUseCase;
  let blogsSqlRepository: BlogsSqlRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Nest создаст экземпляр use case.
        DeleteBlogUseCase,

        // Вместо настоящего репозитория передаст эту заглушку.
        {
          provide: BlogsSqlRepository,
          useValue: {
            findOrNotFoundFail: jest.fn(),
            delete: jest.fn(), // создание заглушки
          },
        },
      ],
    }).compile(); // собирает описанный тестовый модуль

    // Получаем use case и ту же заглушку, которая передана ему.
    deleteBlogUseCase = module.get<DeleteBlogUseCase>(DeleteBlogUseCase);
    blogsSqlRepository = module.get<BlogsSqlRepository>(BlogsSqlRepository);
  });

  it('should delete a blog', async () => {
    const id = '1';
    const name = 'Test blog';
    const description = 'Test description';
    const websiteUrl = 'https://test.blog';
    const isMembership = false;
    const createdAt = new Date();

    const command = new DeleteBlogCommand(id);

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockResolvedValue({
        id,
        name,
        description,
        websiteUrl,
        isMembership,
        createdAt,
      });

    const deleteSpy = jest
      .spyOn(blogsSqlRepository, 'delete')
      .mockResolvedValue(undefined);

    const result = await deleteBlogUseCase.execute(command);

    expect(result).toBeUndefined();
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(command.id);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(id);
  });

  it('should throw NotFound and not delete if the blog does not exist', async () => {
    const id = '1';
    const command = new DeleteBlogCommand(id);

    const error = new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Blog Not Found',
    });

    const findSpy = jest
      .spyOn(blogsSqlRepository, 'findOrNotFoundFail')
      .mockRejectedValue(error);

    const deleteSpy = jest.spyOn(blogsSqlRepository, 'delete');

    await expect(deleteBlogUseCase.execute(command)).rejects.toBe(error);

    expect(findSpy).toHaveBeenCalledWith(id);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

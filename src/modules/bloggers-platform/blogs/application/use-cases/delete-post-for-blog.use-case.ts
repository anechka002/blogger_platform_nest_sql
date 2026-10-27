import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostForBlogCommand)
export class DeletePostForBlogUseCase implements ICommandHandler<DeletePostForBlogCommand> {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}
  async execute({ blogId, postId }: DeletePostForBlogCommand): Promise<void> {
    // Проверяем, что блог существует и не удалён.
    await this.blogsSqlRepository.findOrNotFoundFail(blogId);

    // Проверяем, что post существует и не удалён.
    const post = await this.postsSqlRepository.findOrNotFoundFail(postId);

    // Пост должен принадлежать блогу из URL.
    if (post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found in this blog',
      });
    }

    await this.postsSqlRepository.deletePostForBlog(blogId, postId);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public body: UpdatePostForBlogDto,
  ) {}
}

@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase implements ICommandHandler<UpdatePostForBlogCommand> {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}
  async execute({
    blogId,
    postId,
    body,
  }: UpdatePostForBlogCommand): Promise<void> {
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

    await this.postsSqlRepository.updatePostForBlog(blogId, postId, body);
  }
}

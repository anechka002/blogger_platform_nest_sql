import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts-sql.repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public body: CreatePostForBlogDto,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand> {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}
  async execute({ blogId, body }: CreatePostForBlogCommand): Promise<string> {
    // Проверяем, что блог существует и не удалён.
    await this.blogsSqlRepository.findOrNotFoundFail(blogId);

    // Создаём пост в PostgreSQL.
    const postId = await this.postsSqlRepository.createPostForBlog(
      blogId,
      body,
    );

    return postId;
  }
}

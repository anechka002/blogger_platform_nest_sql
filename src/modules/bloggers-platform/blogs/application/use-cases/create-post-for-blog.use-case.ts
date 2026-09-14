import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { Post } from '../../../posts/domain/post.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public body: CreatePostForBlogDto,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute({ blogId, body }: CreatePostForBlogCommand): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);

    const newPost = Post.createInstancePost({
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId,
      blogName: blog.name,
    });

    const savedPost = await this.postsRepository.create(newPost);
    return savedPost._id.toString();
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute({ dto }: CreatePostCommand): Promise<string> {
    const { blogId, shortDescription, title, content } = dto;

    const foundBlog = await this.blogsRepository.findOrNotFoundFail(blogId);

    const post = Post.createInstancePost({
      blogId,
      shortDescription,
      title,
      content,
      blogName: foundBlog.name,
    });
    const savedPost = await this.postsRepository.create(post);
    return savedPost._id.toString();
  }
}

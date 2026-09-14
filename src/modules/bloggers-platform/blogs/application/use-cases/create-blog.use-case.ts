import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog = Blog.createInstanceBlog({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    const savedBlog = await this.blogsRepository.create(blog);

    return savedBlog._id.toString();
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: CreatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  string
> {
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute({ id, dto }: UpdatePostCommand): Promise<string> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postsRepository.save(post);
    return post._id.toString();
  }
}

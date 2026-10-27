import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../dto/create-blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    await this.blogsSqlRepository.findOrNotFoundFail(id);
    await this.blogsSqlRepository.update(id, dto);
  }
}

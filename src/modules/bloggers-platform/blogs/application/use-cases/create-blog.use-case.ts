import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute({ dto }: CreateBlogCommand): Promise<string> {
    return this.blogsSqlRepository.create(dto);
  }
}

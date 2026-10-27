import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogsSqlRepository.findOrNotFoundFail(id);
    await this.blogsSqlRepository.delete(id);

    // blog.makeDeleted();
    // await this.blogsRepository.save(blog);
  }
}

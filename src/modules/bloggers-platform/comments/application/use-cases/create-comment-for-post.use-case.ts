import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersExternalQueryRepository } from '../../../../user-accounts/users/infrastructure/external-query/users.external-query-repository';
import { CommentDto } from '../../dto/comment.dto';
import { PostsSqlQueryRepository } from '../../../posts/infrastructure/query/posts-sql.query-repository';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class CreateCommentForPostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public dto: CommentDto,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
  constructor(
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
  ) {}
  async execute({
    userId,
    postId,
    dto,
  }: CreateCommentForPostCommand): Promise<string> {
    // Проверяем существование пользователя и поста.
    const user =
      await this.usersExternalQueryRepository.getByIdOrNotFoundFail(userId);

    await this.postsSqlQueryRepository.getByIdOrNotFoundFail(postId);

    return this.commentsSqlRepository.createComment({
      userId: user.id,
      postId,
      content: dto.content,
    });
  }
}

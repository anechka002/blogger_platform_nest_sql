import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentForPostInputDto } from '../../api/input-dto/comment-for-post.input-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { Comment } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersExternalQueryRepository } from '../../../../user-accounts/users/infrastructure/external-query/users.external-query-repository';

export class CreateCommentForPostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public dto: CommentForPostInputDto,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
  constructor(
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute({
    userId,
    postId,
    dto,
  }: CreateCommentForPostCommand): Promise<string> {
    const user =
      await this.usersExternalQueryRepository.getByIdOrNotFoundFail(userId);

    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);

    const newComment = Comment.createComment({
      postId,
      content: dto.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    });

    const savedComment =
      await this.commentsRepository.createComment(newComment);

    return savedComment._id.toString();
  }
}

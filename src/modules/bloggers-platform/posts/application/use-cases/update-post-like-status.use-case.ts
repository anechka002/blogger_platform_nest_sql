import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusDto } from '../../../../../core/dto/like-status.dto';
import { LikeStatus } from '../../../../../core/enum/like-status';
import { UsersExternalQueryRepository } from '../../../../user-accounts/users/infrastructure/external-query/users.external-query-repository';
import { PostsSqlRepository } from '../../infrastructure/posts-sql.repository';
import { PostLikesSqlRepository } from '../../infrastructure/post-like-sql.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public userId: string,
    public postId: string,
    public dto: LikeStatusDto,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<
  UpdatePostLikeStatusCommand,
  void
> {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly postLikesSqlRepository: PostLikesSqlRepository,
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    userId,
    postId,
    dto,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    await this.postsSqlRepository.findOrNotFoundFail(postId);

    await this.usersExternalQueryRepository.getByIdOrNotFoundFail(userId);

    // Ищем реакцию именно этого пользователя именно на этот post.
    const currentReaction = await this.postLikesSqlRepository.findReaction({
      postId,
      userId,
    });

    // Если реакции нет — считай, что предыдущий статус был None.
    const prevStatus = currentReaction?.status ?? LikeStatus.None;

    // если ничего не изменилось, вообще ничего не делаем
    if (prevStatus === dto.likeStatus) {
      return;
    }

    // None → Like/Dislike
    if (!currentReaction && dto.likeStatus !== LikeStatus.None) {
      await this.postLikesSqlRepository.createReaction({
        postId,
        userId,
        status: dto.likeStatus,
      });

      return;
    }

    // Like/Dislike → None
    if (currentReaction && dto.likeStatus === LikeStatus.None) {
      await this.postLikesSqlRepository.deleteReaction({ postId, userId });
      return;
    }

    // Like ↔ Dislike
    if (currentReaction && dto.likeStatus !== LikeStatus.None) {
      await this.postLikesSqlRepository.updateReaction({
        postId,
        userId,
        status: dto.likeStatus,
      });
    }
  }
}

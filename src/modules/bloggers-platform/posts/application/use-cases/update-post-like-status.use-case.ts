import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusDto } from '../../../../../core/dto/like-status.dto';
import { PostLikesRepository } from '../../infrastructure/post-like.repository';
import { LikeStatus } from '../../../../../core/enum/like-status';
import { PostLike } from '../../domain/post-like.entity';

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
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}
  async execute({
    userId,
    postId,
    dto,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);

    // Ищем реакцию именно этого пользователя именно на этот post.
    const currentReaction = await this.postLikesRepository.findReaction({
      postId,
      userId,
    });

    // Если реакции нет — считай, что предыдущий статус был None.
    const prevStatus = currentReaction?.status ?? LikeStatus.None;

    // если ничего не изменилось, вообще ничего не делаем
    if (prevStatus === dto.likeStatus) {
      return;
    }

    // обновляем counters самого Post
    post.updateReactionCounters(prevStatus, dto.likeStatus);

    // None → Like/Dislike
    if (!currentReaction && dto.likeStatus !== LikeStatus.None) {
      const reaction = PostLike.createReaction({
        postId,
        userId,
        status: dto.likeStatus,
      });

      await this.postLikesRepository.createReaction(reaction);
    }

    // Like/Dislike → None
    if (currentReaction && dto.likeStatus === LikeStatus.None) {
      await this.postLikesRepository.deleteReaction({ postId, userId });
    }

    // Like ↔ Dislike
    if (currentReaction && dto.likeStatus !== LikeStatus.None) {
      currentReaction.changeStatus(dto.likeStatus);

      await this.postLikesRepository.updateReaction(currentReaction);
    }

    await this.postsRepository.save(post);
  }
}

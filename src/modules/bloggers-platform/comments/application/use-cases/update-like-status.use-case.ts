import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikeStatusDto } from '../../dto/like-status.dto';
import { CommentLikesRepository } from '../../infrastructure/comment-like.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikeStatus } from '../../../../../core/enum/like-status';
import { CommentLike } from '../../domain/comment-like.entity';

export class UpdateLikeStatusCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public dto: LikeStatusDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<
  UpdateLikeStatusCommand,
  void
> {
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute({
    userId,
    commentId,
    dto,
  }: UpdateLikeStatusCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    // Ищем реакцию именно этого пользователя именно на этот комментарий.
    const currentReaction = await this.commentLikesRepository.findReaction({
      commentId,
      userId,
    });

    // Если реакции нет — считай, что предыдущий статус был None.
    const prevStatus = currentReaction?.status ?? LikeStatus.None;

    if (prevStatus === dto.likeStatus) {
      return;
    }

    // обновляем counters самого Comment
    comment.updateReactionCounters(prevStatus, dto.likeStatus);

    // None → Like/Dislike
    if (!currentReaction && dto.likeStatus !== LikeStatus.None) {
      const reaction = CommentLike.createReaction({
        commentId,
        userId,
        status: dto.likeStatus,
      });

      await this.commentLikesRepository.createReaction(reaction);
    }

    // Like/Dislike → None
    if (currentReaction && dto.likeStatus === LikeStatus.None) {
      await this.commentLikesRepository.deleteReaction({ commentId, userId });
    }

    // Like ↔ Dislike
    if (currentReaction && dto.likeStatus !== LikeStatus.None) {
      currentReaction.changeStatus(dto.likeStatus);

      await this.commentLikesRepository.updateReaction(currentReaction);
    }

    await this.commentsRepository.saveComment(comment);
  }
}

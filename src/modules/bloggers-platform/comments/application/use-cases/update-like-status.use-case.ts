import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikeStatusDto } from '../../../../../core/dto/like-status.dto';
import { LikeStatus } from '../../../../../core/enum/like-status';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';
import { CommentLikesSqlRepository } from '../../infrastructure/comment-like-sql.repository';

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
    private readonly commentLikesSqlRepository: CommentLikesSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
  ) {}
  async execute({
    userId,
    commentId,
    dto,
  }: UpdateLikeStatusCommand): Promise<void> {
    const comment = await this.commentsSqlRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    // Ищем реакцию именно этого пользователя именно на этот комментарий.
    const currentReaction = await this.commentLikesSqlRepository.findReaction({
      commentId,
      userId,
    });

    // Если реакции нет — считай, что предыдущий статус был None.
    const prevStatus = currentReaction?.status ?? LikeStatus.None;

    if (prevStatus === dto.likeStatus) {
      return;
    }

    // None → Like/Dislike
    if (!currentReaction && dto.likeStatus !== LikeStatus.None) {
      await this.commentLikesSqlRepository.createReaction({
        commentId,
        userId,
        status: dto.likeStatus,
      });
      return;
    }

    // Like/Dislike → None
    if (currentReaction && dto.likeStatus === LikeStatus.None) {
      await this.commentLikesSqlRepository.deleteReaction({
        commentId,
        userId,
      });
      return;
    }

    // Like ↔ Dislike
    if (currentReaction && dto.likeStatus !== LikeStatus.None) {
      await this.commentLikesSqlRepository.updateReaction({
        commentId,
        userId,
        status: dto.likeStatus,
      });
    }
  }
}

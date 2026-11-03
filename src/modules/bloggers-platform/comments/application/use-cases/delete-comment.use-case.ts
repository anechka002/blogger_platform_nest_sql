import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class DeleteCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<
  DeleteCommentCommand,
  void
> {
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}
  async execute({ userId, commentId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsSqlRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    await this.commentsSqlRepository.deleteComment(comment.id);
  }
}

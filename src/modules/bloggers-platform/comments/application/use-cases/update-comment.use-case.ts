import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDto } from '../../dto/comment.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class UpdateCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public dto: CommentDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}
  async execute({
    userId,
    commentId,
    dto,
  }: UpdateCommentCommand): Promise<void> {
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

    await this.commentsSqlRepository.updateComment(comment.id, dto.content);
  }
}

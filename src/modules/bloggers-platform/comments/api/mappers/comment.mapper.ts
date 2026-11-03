import { CommentWithLikesRow } from '../../infrastructure/query/comments-sql.query-repository';
import { CommentViewDto } from '../view-dto/comment.view-dto';

export class CommentMapper {
  public toCommentViewModel(comment: CommentWithLikesRow): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: comment.myStatus,
      },
    };
  }
}

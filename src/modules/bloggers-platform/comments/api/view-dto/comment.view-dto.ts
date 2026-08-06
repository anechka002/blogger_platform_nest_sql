import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: Info;
  createdAt: Date;
  likesInfo: LikeInfo;

  static mapToView(
    comment: CommentDocument,
    myStatus: LikeStatus,
  ): CommentViewDto {
    const dto = new this();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;

    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus,
    };

    return dto;
  }
}

type Info = {
  userId: string;
  userLogin: string;
};

export type LikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

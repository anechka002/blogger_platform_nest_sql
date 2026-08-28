import { CommentDocument } from '../../domain/comment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../../../../core/enum/like-status';

class Info {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

class LikeInfo {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({ enum: LikeStatus })
  myStatus: LikeStatus;
}

export class CommentViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: Info })
  commentatorInfo: Info;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: LikeInfo })
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

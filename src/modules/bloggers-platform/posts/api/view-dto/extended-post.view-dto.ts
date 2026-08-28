import { PostDocument } from '../../domain/post.entity';
import { PostLikeDocument } from '../../domain/post-like.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../../../../core/enum/like-status';

class NewestLike {
  @ApiProperty()
  addedAt: Date;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  login: string;
}

class ExtendedLikesInfo {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({ enum: LikeStatus })
  myStatus: LikeStatus;

  @ApiProperty({ type: [NewestLike] })
  newestLikes: NewestLike[];
}

export class ExtendedPostViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ExtendedLikesInfo })
  extendedLikesInfo: ExtendedLikesInfo;

  static mapExtendedToView(
    post: PostDocument,
    myStatus: LikeStatus,
    newestLikes: PostLikeDocument[],
  ): ExtendedPostViewDto {
    const dto = new this();

    dto.id = post.id;
    dto.title = post.title;
    dto.content = post.content;
    dto.shortDescription = post.shortDescription;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus,
      newestLikes: newestLikes.map((like) => ({
        addedAt: like.updatedAt,
        userId: like.user_id,
        login: like.user_login,
      })),
    };
    return dto;
  }
}

import { PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../comments/api/view-dto/comment.view-dto';
import { PostLikeDocument } from '../../domain/post-like.entity';

export class ExtendedPostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
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
        addedAt: like.updatedAt.toISOString(),
        userId: like.user_id,
        login: like.user_login,
      })),
    };
    return dto;
  }
}

type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLike[];
};

import { PostWithLikesRow } from '../../infrastructure/query/posts-sql.query-repository';
import { ExtendedPostViewDto } from '../view-dto/extended-post.view-dto';
import { LikeStatus } from '../../../../../core/enum/like-status';

export class PostMapper {
  public toExtendedPostViewModel(post: PostWithLikesRow): ExtendedPostViewDto {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
}

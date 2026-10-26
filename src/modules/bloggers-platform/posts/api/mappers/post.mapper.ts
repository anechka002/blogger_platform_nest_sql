import { PostWithBlogNameRow } from '../../infrastructure/query/posts-sql.query-repository';
import { CurrentPostViewModel } from '../view-dto/current-post.view-model';

export class PostMapper {
  public toCurrentPostsViewModel(
    post: PostWithBlogNameRow,
  ): CurrentPostViewModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    };
  }
}

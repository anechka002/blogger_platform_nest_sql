import { CurrentBlogViewModel } from '../view-dto/current-blog.view-model';
import { BlogRow } from '../../infrastructure/query/blogs-sql.query-repository';

export class BlogMapper {
  public toCurrentBlogsViewModel(blog: BlogRow): CurrentBlogViewModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}

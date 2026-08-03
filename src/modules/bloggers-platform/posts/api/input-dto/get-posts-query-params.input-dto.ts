import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostSortBy } from './post-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: PostSortBy = PostSortBy.CreatedAt;
}

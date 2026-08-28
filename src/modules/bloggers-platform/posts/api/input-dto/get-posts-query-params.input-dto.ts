import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostSortBy } from './post-sort-by';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPostsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: PostSortBy.CreatedAt })
  sortBy: PostSortBy = PostSortBy.CreatedAt;
}

import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogSortBy } from './blog-sort-by';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBlogsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: BlogSortBy.CreatedAt })
  sortBy: BlogSortBy = BlogSortBy.CreatedAt;

  @ApiPropertyOptional({
    description:
      'Search term for blog Name: Name should contains this term in any position',
    default: null,
    nullable: true,
    type: String,
  })
  searchNameTerm: string | null = null;
}

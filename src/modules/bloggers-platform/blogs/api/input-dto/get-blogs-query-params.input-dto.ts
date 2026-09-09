import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogSortBy } from './blog-sort-by';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetBlogsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: BlogSortBy.CreatedAt })
  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy: BlogSortBy = BlogSortBy.CreatedAt;

  @ApiPropertyOptional({
    description:
      'Search term for blog Name: Name should contains this term in any position',
    default: null,
    nullable: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}

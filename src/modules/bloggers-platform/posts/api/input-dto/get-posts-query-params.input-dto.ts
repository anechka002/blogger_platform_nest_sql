import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostSortBy } from './post-sort-by';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetPostsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: PostSortBy.CreatedAt })
  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy: PostSortBy = PostSortBy.CreatedAt;
}

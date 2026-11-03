import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CommentSortBy } from './comment-sort-by';

export class GetCommentsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: CommentSortBy.CreatedAt })
  @IsOptional()
  @IsEnum(CommentSortBy)
  sortBy: CommentSortBy = CommentSortBy.CreatedAt;
}

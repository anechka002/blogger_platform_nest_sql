import { CommentViewDto } from './comment.view-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class CommentsPaginationViewDto extends PaginationViewDto<CommentViewDto> {
  @ApiProperty({
    type: [CommentViewDto],
  })
  items: CommentViewDto[];
}

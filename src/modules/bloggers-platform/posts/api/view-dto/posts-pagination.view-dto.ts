import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { ExtendedPostViewDto } from './extended-post.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class PostsPaginationViewDto extends PaginationViewDto<ExtendedPostViewDto> {
  @ApiProperty({
    type: [ExtendedPostViewDto],
  })
  items: ExtendedPostViewDto[];
}

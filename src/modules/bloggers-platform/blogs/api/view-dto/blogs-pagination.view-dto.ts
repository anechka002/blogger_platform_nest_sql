import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './blog.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class BlogsPaginationViewDto extends PaginationViewDto<BlogViewDto> {
  @ApiProperty({
    type: [BlogViewDto],
  })
  items: BlogViewDto[];
}

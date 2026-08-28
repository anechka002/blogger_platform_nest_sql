import { ApiProperty } from '@nestjs/swagger';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './user.view-dto';

export class UsersPaginationViewDto extends PaginationViewDto<UserViewDto> {
  @ApiProperty({
    type: [UserViewDto],
  })
  items: UserViewDto[];
}

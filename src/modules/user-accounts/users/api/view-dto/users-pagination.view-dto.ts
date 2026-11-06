import { ApiProperty } from '@nestjs/swagger';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { UserViewModel } from './user.view-model';

export class UsersPaginationViewDto extends PaginationViewDto<UserViewModel> {
  @ApiProperty({
    type: [UserViewModel],
  })
  items: UserViewModel[];
}

import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserDocument } from '../../domain/user.entity';
import { UserViewModel } from './user.view-model';

export class MeViewDto extends OmitType(UserViewModel, [
  'id',
  'createdAt',
] as const) {
  @ApiProperty()
  userId: string;

  static mapToView(user: UserDocument): MeViewDto {
    const dto = new this();

    dto.userId = user.id;
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}

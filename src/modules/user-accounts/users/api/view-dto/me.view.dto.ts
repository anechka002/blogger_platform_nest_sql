import { UserDocument } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MeViewDto {
  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

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

import { UserDocument } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({ example: '66c9f90dc6c20a7c25123456' })
  id: string;

  @ApiProperty({ example: 'anna' })
  login: string;

  @ApiProperty({ example: 'anna@gmail.com' })
  email: string;

  @ApiProperty({ example: '2026-08-28T09:15:02.723Z' })
  createdAt: Date;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new this();

    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { UserRow } from '../../infrastructure/query/users-sql.query-repository';

export class UserViewModel {
  @ApiProperty({ example: '66c9f90dc6c20a7c25123456' })
  id: string;

  @ApiProperty({ example: 'anna' })
  login: string;

  @ApiProperty({ example: 'anna@gmail.com' })
  email: string;

  @ApiProperty({ example: '2026-08-28T09:15:02.723Z' })
  createdAt: Date;

  static mapToView(user: UserRow): UserViewModel {
    const dto = new this();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

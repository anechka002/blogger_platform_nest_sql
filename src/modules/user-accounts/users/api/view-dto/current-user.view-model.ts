import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserViewModel {
  @ApiProperty({ example: '66c9f90dc6c20a7c25123456' })
  public id: string;

  @ApiProperty({ example: 'anna' })
  public login: string;

  @ApiProperty({ example: 'anna@gmail.com' })
  public email: string;

  @ApiProperty({ example: '2026-08-28T09:15:02.723Z' })
  public createdAt: Date;
}

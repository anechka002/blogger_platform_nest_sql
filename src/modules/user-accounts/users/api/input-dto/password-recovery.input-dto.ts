import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class PasswordRecoveryInputDto {
  @ApiProperty({ example: 'useremail@company.com' })
  @IsEmail()
  @IsString()
  email: string;
}

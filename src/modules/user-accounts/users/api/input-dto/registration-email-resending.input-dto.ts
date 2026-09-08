import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegistrationEmailResendingInputDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsString()
  email: string;
}

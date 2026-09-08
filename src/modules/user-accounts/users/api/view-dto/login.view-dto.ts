import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginViewDto {
  @ApiProperty()
  @IsString()
  accessToken: string;
}

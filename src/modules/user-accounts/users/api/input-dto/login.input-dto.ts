import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AccessTokenViewDto {
  @ApiProperty()
  @IsString()
  accessToken: string;
}

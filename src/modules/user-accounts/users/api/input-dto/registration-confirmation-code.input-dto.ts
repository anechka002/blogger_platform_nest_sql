import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationConfirmationCodeInputDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  code: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FieldError {
  @ApiPropertyOptional({
    type: String,
    description: 'Message with error explanation for certain field',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  message?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'What field/property of input model has error',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  field?: string | null;
}

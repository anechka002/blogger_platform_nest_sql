import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CommentForPostInputDto {
  @ApiProperty({
    minLength: 20,
    maxLength: 300,
  })
  @IsString()
  @Length(20, 300)
  content: string;
}

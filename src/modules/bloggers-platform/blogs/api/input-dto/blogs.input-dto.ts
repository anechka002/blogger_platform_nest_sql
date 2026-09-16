import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateBlogInputDto {
  @ApiProperty()
  @IsString()
  @Length(1, 15)
  @Trim()
  name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  @Trim()
  description: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

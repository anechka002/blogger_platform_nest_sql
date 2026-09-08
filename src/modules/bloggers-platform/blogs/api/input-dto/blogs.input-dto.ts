import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateBlogInputDto {
  @ApiProperty()
  @IsString()
  @Length(1, 15)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  websiteUrl: string;
}

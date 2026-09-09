import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreatePostForBlogInputDto implements CreatePostForBlogDto {
  @ApiProperty()
  @IsString()
  @Length(1, 30)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  shortDescription: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  content: string;
}

import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostForBlogInputDto implements CreatePostForBlogDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;
}

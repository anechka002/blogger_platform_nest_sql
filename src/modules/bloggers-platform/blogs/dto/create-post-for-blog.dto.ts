import { ApiProperty } from '@nestjs/swagger';

export class CreatePostForBlogDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;
}

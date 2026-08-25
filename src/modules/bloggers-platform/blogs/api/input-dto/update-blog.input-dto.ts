import { UpdateBlogDto } from '../../dto/create-blog.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;
}

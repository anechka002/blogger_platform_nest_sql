import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogInputDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;
}

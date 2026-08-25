import { ApiProperty } from '@nestjs/swagger';

export class CreatePostInputDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  blogId: string;
}

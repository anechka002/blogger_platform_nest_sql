import { UpdatePostDto } from '../../dto/create-post.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostInputDto implements UpdatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;
}

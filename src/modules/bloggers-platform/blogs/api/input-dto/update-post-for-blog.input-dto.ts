import { UpdatePostForBlogDto } from '../../dto/create-post-for-blog.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class UpdatePostForBlogInputDto implements UpdatePostForBlogDto {
  @ApiProperty()
  @IsString()
  @Length(1, 30)
  @Trim()
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  @Trim()
  shortDescription: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  @Trim()
  content: string;
}

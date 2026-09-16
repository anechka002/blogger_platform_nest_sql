import { UpdatePostDto } from '../../dto/create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class UpdatePostInputDto implements UpdatePostDto {
  @ApiProperty()
  @IsString()
  @Length(1, 30)
  @Trim()
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  @Trim()
  content: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  @Trim()
  shortDescription: string;

  @ApiProperty()
  @IsString()
  blogId: string;
}

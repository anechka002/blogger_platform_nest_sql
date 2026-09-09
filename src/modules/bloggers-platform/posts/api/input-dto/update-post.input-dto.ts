import { UpdatePostDto } from '../../dto/create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePostInputDto implements UpdatePostDto {
  @ApiProperty()
  @IsString()
  @Length(1, 30)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  content: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  shortDescription: string;

  @ApiProperty()
  @IsString()
  blogId: string;
}

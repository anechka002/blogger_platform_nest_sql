import { UpdateBlogDto } from '../../dto/create-blog.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @ApiProperty()
  @IsString()
  @Length(1, 15)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiProperty({
    example:
      'https://3IEj4gY7RE1cJUhCPR2L8PMiXEutiR0g.0gXcb2PyhuSGS5ZWLbdBGeUcdBcYiJC__54zDJItt4a3g9mgPGH0lv1ZbkZ',
  })
  @IsString()
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

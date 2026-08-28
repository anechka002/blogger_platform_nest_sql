import { UpdateBlogDto } from '../../dto/create-blog.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    example:
      'https://3IEj4gY7RE1cJUhCPR2L8PMiXEutiR0g.0gXcb2PyhuSGS5ZWLbdBGeUcdBcYiJC__54zDJItt4a3g9mgPGH0lv1ZbkZ',
  })
  websiteUrl: string;
}

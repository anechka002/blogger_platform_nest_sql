import { IsNotEmpty, IsUUID } from 'class-validator';

export class BlogPostParamsDto {
  @IsUUID()
  @IsNotEmpty()
  blogId: string;

  @IsUUID()
  @IsNotEmpty()
  postId: string;
}

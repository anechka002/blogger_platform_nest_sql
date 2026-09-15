import { IsString, Length } from 'class-validator';

export class CommentDto {
  @IsString()
  @Length(20, 300)
  content: string;
}

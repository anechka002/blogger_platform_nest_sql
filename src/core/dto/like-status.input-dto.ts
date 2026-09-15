import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../enum/like-status';
import { IsEnum } from 'class-validator';

export class LikeStatusInputDto {
  @ApiProperty({
    enum: LikeStatus,
    description: 'Send None if you want to remove like/dislike',
    example: LikeStatus.Like,
  })
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

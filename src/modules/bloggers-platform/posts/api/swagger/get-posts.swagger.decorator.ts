import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { PostsPaginationViewDto } from '../view-dto/posts-pagination.view-dto';

export function GetPostsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return all posts',
    }),

    ApiOkResponse({
      description: 'Success',
      type: PostsPaginationViewDto,
    }),
  );
}

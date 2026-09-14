import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { PostsPaginationViewDto } from '../../../posts/api/view-dto/posts-pagination.view-dto';

export function GetPostsForBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns all posts for specific blog',
    }),

    ApiOkResponse({
      description: 'Success',
      type: PostsPaginationViewDto,
    }),

    ApiNotFoundResponse({
      description: 'If specified blog is not exists',
    }),
  );
}

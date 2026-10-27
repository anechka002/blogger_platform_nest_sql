import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeletePostForBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete post specified id',
    }),

    ApiParam({
      name: 'blogId',
      description: 'Blog ID',
      type: String,
    }),

    ApiParam({
      name: 'postId',
      description: 'Post ID',
      type: String,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

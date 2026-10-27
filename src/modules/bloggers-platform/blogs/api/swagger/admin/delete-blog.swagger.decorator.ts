import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete blog specified by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Blog id',
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

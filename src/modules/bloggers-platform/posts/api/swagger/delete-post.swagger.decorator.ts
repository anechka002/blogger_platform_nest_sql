import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeletePostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete post specified by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Post id',
      type: String,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiBasicAuth('basicAuth'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteUserSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user specified by id',
    }),

    ApiParam({
      name: 'id',
      description: 'User id',
      type: String,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'If specified user is not exists',
    }),

    ApiBasicAuth('basicAuth'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

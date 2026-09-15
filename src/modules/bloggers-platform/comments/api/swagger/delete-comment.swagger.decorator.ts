import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteCommentSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete comment specified by id',
    }),

    ApiParam({
      name: 'commentId',
      type: String,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiBearerAuth('bearer'),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiForbiddenResponse({
      description: 'If try edit the comment that is not your own',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

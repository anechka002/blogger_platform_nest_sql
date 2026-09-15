import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CommentForPostInputDto } from '../input-dto/comment-for-post.input-dto';
import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';

export function UpdateCommentSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update existing comment by id with InputModel',
    }),

    ApiParam({
      name: 'commentId',
      type: String,
    }),

    ApiBody({
      description: 'Data for updating',
      type: CommentForPostInputDto,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiBearerAuth('bearer'),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

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

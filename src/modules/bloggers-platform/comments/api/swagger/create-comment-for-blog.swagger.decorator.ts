import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CommentForPostInputDto } from '../input-dto/comment-for-post.input-dto';
import { CommentViewDto } from '../view-dto/comment.view-dto';
import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';

export function CreateCommentForPostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new comment',
    }),

    ApiBody({
      description: 'Data for constructing new Post entity',
      type: CommentForPostInputDto,
    }),

    ApiCreatedResponse({
      description: 'Returns the newly created post',
      type: CommentViewDto,
    }),

    ApiBearerAuth('bearer'),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

    ApiNotFoundResponse({
      description: "If post with specified postId doesn't exists",
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

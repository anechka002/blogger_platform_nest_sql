import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';
import { LikeStatusInputDto } from '../../../../../core/dto/like-status.input-dto';

export function LikeStatusForCommentSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Make like/unlike/dislike/undislike operation',
    }),

    ApiParam({
      name: 'commentId',
      type: String,
    }),

    ApiBody({
      description: 'Data for updating',
      type: LikeStatusInputDto,
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
      description: "If comment with specified id doesn't exists",
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

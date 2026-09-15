import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { CommentViewDto } from '../view-dto/comment.view-dto';

export function GetCommentByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return comment by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Existing comment id',
      type: String,
    }),

    ApiOkResponse({
      description: 'Success',
      type: CommentViewDto,
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CommentsPaginationViewDto } from '../../../comments/api/view-dto/comments-pagination.view-dto';

export function GetCommentsForPostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns comments for specific post',
    }),

    ApiOkResponse({
      description: 'Success',
      type: CommentsPaginationViewDto,
    }),

    ApiNotFoundResponse({
      description: "If post for passed postId doesn't exists",
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ExtendedPostViewDto } from '../view-dto/extended-post.view-dto';

export function GetPostByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return post by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Existing post id',
      type: String,
    }),

    ApiOkResponse({
      description: 'Success',
      type: ExtendedPostViewDto,
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),
  );
}

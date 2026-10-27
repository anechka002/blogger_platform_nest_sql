import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';
import { UpdatePostForBlogInputDto } from '../../input-dto/update-post-for-blog.input-dto';

export function UpdatePostForBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update existing post by id with InputModel',
    }),

    ApiParam({
      name: 'blogId',
      description: 'Blog ID',
      type: String,
    }),

    ApiParam({
      name: 'postId',
      description: 'Post ID',
      type: String,
    }),

    ApiBody({
      description: 'Data for updating',
      type: UpdatePostForBlogInputDto,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';
import { CreatePostInputDto } from '../input-dto/posts.input-dto';
import { ExtendedPostViewDto } from '../view-dto/extended-post.view-dto';
import { UpdatePostInputDto } from '../input-dto/update-post.input-dto';

export function UpdatePostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update existing post by id with InputModel',
    }),

    ApiParam({
      name: 'id',
      description: 'Existing post id',
      type: String,
    }),

    ApiBody({
      description: 'Data for updating',
      type: UpdatePostInputDto,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiBasicAuth('basicAuth'),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

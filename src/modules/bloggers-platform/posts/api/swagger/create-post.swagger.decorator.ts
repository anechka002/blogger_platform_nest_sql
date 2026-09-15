import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';
import { CreatePostInputDto } from '../input-dto/posts.input-dto';
import { ExtendedPostViewDto } from '../view-dto/extended-post.view-dto';

export function CreatePostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new post',
    }),

    ApiBody({
      description: 'Data for constructing new post entity',
      type: CreatePostInputDto,
    }),

    ApiCreatedResponse({
      description: 'Returns the newly created post',
      type: ExtendedPostViewDto,
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

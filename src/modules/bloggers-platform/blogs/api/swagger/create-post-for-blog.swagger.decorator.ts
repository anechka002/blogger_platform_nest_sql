import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateBlogInputDto } from '../input-dto/blogs.input-dto';
import { BlogViewDto } from '../view-dto/blog.view-dto';
import { APIErrorResult } from '../../../../../core/exceptions/filters/api-error-result';
import { CreatePostForBlogInputDto } from '../input-dto/create-post-for-blog.input-dto';
import { ExtendedPostViewDto } from '../../../posts/api/view-dto/extended-post.view-dto';

export function CreatePostForBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new post for specific blog',
    }),

    ApiBody({
      description: 'Data for constructing new Post entity',
      type: CreatePostForBlogInputDto,
    }),

    ApiCreatedResponse({
      description: 'Returns the newly created post',
      type: ExtendedPostViewDto,
    }),

    ApiBasicAuth('basicAuth'),

    ApiNotFoundResponse({
      description: "If specified blog doesn't exists",
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

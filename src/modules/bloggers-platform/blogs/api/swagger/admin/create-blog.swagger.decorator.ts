import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateBlogInputDto } from '../../input-dto/blogs.input-dto';
import { BlogViewDto } from '../../view-dto/blog.view-dto';
import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';

export function CreateBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new blog',
    }),

    ApiBody({
      description: 'Data for constructing new Blog entity',
      type: CreateBlogInputDto,
    }),

    ApiCreatedResponse({
      description: 'Returns the newly created blog',
      type: BlogViewDto,
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

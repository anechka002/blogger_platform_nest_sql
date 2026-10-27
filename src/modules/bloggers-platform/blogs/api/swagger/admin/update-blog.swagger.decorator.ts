import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';

export function UpdateBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update existing Blog by id with InputModel',
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

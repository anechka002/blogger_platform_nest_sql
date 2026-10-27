import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { BlogViewDto } from '../../view-dto/blog.view-dto';

export function GetBlogByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return blog by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Existing blog id',
      type: String,
    }),

    ApiOkResponse({
      description: 'Success',
      type: BlogViewDto,
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),
  );
}

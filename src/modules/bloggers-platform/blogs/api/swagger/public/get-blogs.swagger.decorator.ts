import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { BlogsPaginationViewDto } from '../../view-dto/blogs-pagination.view-dto';

export function GetBlogsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return blogs with paging',
    }),

    ApiOkResponse({
      description: 'Success',
      type: BlogsPaginationViewDto,
    }),
  );
}

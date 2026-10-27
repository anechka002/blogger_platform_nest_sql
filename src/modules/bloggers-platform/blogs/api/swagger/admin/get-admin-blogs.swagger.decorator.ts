import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BlogsPaginationViewDto } from '../../view-dto/blogs-pagination.view-dto';

export function GetAdminBlogsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return all blogs with paging',
    }),

    ApiOkResponse({
      description: 'Success',
      type: BlogsPaginationViewDto,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

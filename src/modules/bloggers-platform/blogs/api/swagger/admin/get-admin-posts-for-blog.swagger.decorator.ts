import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostsPaginationViewDto } from '../../../../posts/api/view-dto/posts-pagination.view-dto';

export function GetAdminPostsForBlogSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns posts for blog with paging and sorting',
    }),

    ApiOkResponse({
      description: 'Success',
      type: PostsPaginationViewDto,
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

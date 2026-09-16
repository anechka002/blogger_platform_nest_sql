import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersPaginationViewDto } from '../../view-dto/users-pagination.view-dto';

export function GetUsersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return all users',
    }),

    ApiBasicAuth('basicAuth'),

    ApiOkResponse({
      description: 'Success',
      type: UsersPaginationViewDto,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

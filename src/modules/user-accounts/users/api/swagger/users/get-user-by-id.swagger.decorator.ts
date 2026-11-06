import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { UserViewModel } from '../../view-dto/user.view-model';

export function GetUserByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return user by id',
    }),

    ApiParam({
      name: 'id',
      description: 'Existing user id',
      type: String,
    }),

    ApiBasicAuth('basicAuth'),

    ApiOkResponse({
      description: 'Success',
      type: UserViewModel,
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';
import { CreateUserInputDto } from '../../input-dto/users.input-dto';
import { UserViewModel } from '../../view-dto/user.view-model';

export function CreateUserSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add new user to the system',
    }),

    ApiBody({
      description: 'Data for constructing new user',
      type: CreateUserInputDto,
    }),

    ApiCreatedResponse({
      description: 'Returns the newly created user',
      type: UserViewModel,
    }),

    ApiBasicAuth('basicAuth'),

    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values.\n' +
        '\n' +
        'Note: If the error should be in the BLL, for example, "the email address is not unique", do not try to mix this error with input validation errors in the middleware, just return one element in the errors array\n' +
        '\n',
      type: APIErrorResult,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

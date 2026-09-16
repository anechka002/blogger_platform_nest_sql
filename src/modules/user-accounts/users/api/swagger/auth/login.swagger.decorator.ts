import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';
import { AccessTokenViewDto } from '../../view-dto/login.view-dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Try login user to the system',
    }),

    ApiOkResponse({
      description: 'Returns JWT accessToken (expired after 5 minutes) in body.',
      type: AccessTokenViewDto,
    }),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

    ApiUnauthorizedResponse({
      description: 'If the password or login or email is wrong',
    }),
  );
}

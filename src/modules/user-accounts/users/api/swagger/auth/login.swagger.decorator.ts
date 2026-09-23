import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
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
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
      type: AccessTokenViewDto,
    }),

    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
    }),

    ApiUnauthorizedResponse({
      description: 'If the password or login or email is wrong',
    }),

    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

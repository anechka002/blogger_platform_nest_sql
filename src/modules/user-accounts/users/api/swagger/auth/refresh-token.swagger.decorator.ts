import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AccessTokenViewDto } from '../../view-dto/login.view-dto';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
    }),

    ApiOkResponse({
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
      type: AccessTokenViewDto,
    }),

    ApiCookieAuth('refreshToken'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

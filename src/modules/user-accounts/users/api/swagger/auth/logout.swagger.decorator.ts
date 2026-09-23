import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function LogoutSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiCookieAuth('refreshToken'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

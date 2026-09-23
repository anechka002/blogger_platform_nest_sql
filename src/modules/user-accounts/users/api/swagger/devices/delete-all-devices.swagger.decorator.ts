import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteAllDevicesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Terminate all other (exclude current) device's sessions",
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

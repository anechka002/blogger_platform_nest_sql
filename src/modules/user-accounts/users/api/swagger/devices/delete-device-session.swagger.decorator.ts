import { applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteDeviceSessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Terminate specified device session',
    }),

    ApiParam({
      name: 'deviceId',
      description: 'Id of session that will be terminated',
      type: String,
    }),

    ApiNoContentResponse({
      description: 'No Content',
    }),

    ApiNotFoundResponse({
      description: 'Not Found',
    }),

    ApiCookieAuth('refreshToken'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),

    ApiForbiddenResponse({
      description: 'If try to delete the deviceId of other user',
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DeviceSessionViewDto } from '../../view-dto/device-session.view-dto';

export function GetDevicesWithActiveSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns all devices with active sessions for current user',
    }),

    ApiCookieAuth('refreshToken'),

    ApiOkResponse({
      description: 'Success',
      type: DeviceSessionViewDto,
      isArray: true,
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

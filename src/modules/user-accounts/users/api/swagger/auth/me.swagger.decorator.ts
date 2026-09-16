import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { MeViewDto } from '../../view-dto/me.view.dto';

export function MeSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get information about current user',
    }),

    ApiOkResponse({
      description: 'Success',
      type: MeViewDto,
    }),

    ApiBearerAuth('bearer'),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

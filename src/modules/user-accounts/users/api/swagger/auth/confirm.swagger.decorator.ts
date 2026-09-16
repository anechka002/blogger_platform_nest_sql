import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';
import { RegistrationConfirmationCodeInputDto } from '../../input-dto/registration-confirmation-code.input-dto';

export function ConfirmSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm registration',
    }),

    ApiBody({
      type: RegistrationConfirmationCodeInputDto,
    }),

    ApiNoContentResponse({
      description: 'Email was verified. Account was activated',
    }),

    ApiBadRequestResponse({
      description:
        'If the confirmation code is incorrect, expired or already been applied',
      type: APIErrorResult,
    }),

    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

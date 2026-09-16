import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { APIErrorResult } from '../../../../../../core/exceptions/filters/api-error-result';
import { CreateUserInputDto } from '../../input-dto/users.input-dto';

export function RegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Registration in the system. Email with confirmation code will be send to passed email address',
    }),

    ApiBody({
      description: 'Data for registration',
      type: CreateUserInputDto,
    }),

    ApiNoContentResponse({
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),

    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
      type: APIErrorResult,
    }),

    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

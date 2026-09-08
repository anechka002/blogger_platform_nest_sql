import { FieldError } from './field-error';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class APIErrorResult {
  @ApiPropertyOptional({ type: [FieldError], nullable: true })
  errorsMessages?: FieldError[];
}

import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { Trim } from '../transform/trim';

// Объединение декораторов
export const IsStringWithTrim = (minLength: number, maxLength: number) =>
  applyDecorators(IsString(), Length(minLength, maxLength), Trim());

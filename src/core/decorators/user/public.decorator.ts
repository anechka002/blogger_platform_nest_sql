import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// обязательна ли авторизация?
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

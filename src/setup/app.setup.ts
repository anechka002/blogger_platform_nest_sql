import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication) {
  app.use(cookieParser());
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
}

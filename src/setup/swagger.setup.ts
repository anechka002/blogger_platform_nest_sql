import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .addBearerAuth()
    .setVersion('1.0')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
      },
      'basicAuth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token only',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description:
          'JWT refreshToken inside cookie. Must be correct, and must not expire',
      },
      'refreshToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${GLOBAL_PREFIX}/swagger`, app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}

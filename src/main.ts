import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { generateNestGraph } from './core/dev/nest-graph';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  const port = coreConfig.port;

  appSetup(app); //глобальные настройки приложения

  generateNestGraph(app);

  await app.listen(port, () => {
    console.log(`Я завелся на ${port} порту`);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();

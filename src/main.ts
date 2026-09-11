import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { generateNestGraph } from './core/dev/nest-graph';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSetup(app); //глобальные настройки приложения

  generateNestGraph(app);

  await app.listen(PORT, () => {
    console.log(`Я завелся на ${PORT} порту`);
  });
}
bootstrap();

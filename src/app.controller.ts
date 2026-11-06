import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './core/decorators/user/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health check — проверка состояния приложения.

  // Проверяем, что приложение отвечает на HTTP-запросы.
  @Public()
  @Get('live')
  live(): { status: string } {
    return this.appService.live();
  }

  // Проверяем, что приложение может обратиться к базе.
  @Public()
  @Get('ready')
  async ready(): Promise<{ status: string; database: string }> {
    return this.appService.ready();
  }
}

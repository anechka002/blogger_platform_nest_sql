import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './core/decorators/user/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health check — проверка состояния приложения.

  // вспомогательный endpoint для проверки работы приложения
  @ApiOperation({ summary: 'Health check for app' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'string',
          example: 'Ok!',
        },
      },
    },
  })
  @Public()
  @Get()
  public checkApp() {
    return 'Ok!';
  }

  // Проверяем, что приложение отвечает на HTTP-запросы.
  @ApiOperation({ summary: 'Health check for HTTP request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  @Public()
  @Get('live')
  public live(): { status: string } {
    return { status: 'ok' };
  }

  // Проверяем, что приложение может обратиться к базе.
  @ApiOperation({ summary: 'Health check for database' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The application can reach the database',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['status', 'database'],
          properties: {
            status: { type: 'string', example: 'ok' },
            database: { type: 'string', example: 'database up' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'The database readiness check failed',
  })
  @Public()
  @Get('ready')
  async ready(): Promise<{ status: string; database: string }> {
    return this.appService.ready();
  }
}

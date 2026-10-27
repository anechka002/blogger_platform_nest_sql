import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear database: delete all data from all tables/collections',
  })
  @ApiNoContentResponse({
    description: 'All data is deleted',
  })
  async deleteAll() {
    await this.dataSource.transaction(async (manager) => {
      // Сначала удаляем связанные записи
      await manager.query('DELETE FROM public.post_likes');
      await manager.query('DELETE FROM public.posts');
      await manager.query('DELETE FROM public.blogs');

      // Затем пользователей
      await manager.query('DELETE FROM public.devices');
      await manager.query('DELETE FROM public.user_account_state');
      await manager.query('DELETE FROM public.users');
    });
  }
}

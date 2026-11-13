import { Injectable } from '@nestjs/common';
import { DomainException } from './core/exceptions/domain-exceptions';
import { DomainExceptionCode } from './core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async ready(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'database up' };
    } catch (error) {
      // Подробная причина — в консоли сервера.
      console.error('Ошибка проверки готовности:', error);

      throw new DomainException({
        code: DomainExceptionCode.ServiceUnavailable,
        message: 'Сервис временно недоступен',
        extensions: [
          {
            message: 'database down',
            key: 'database',
          },
        ],
      });
    }
  }
}

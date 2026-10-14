import { Injectable } from '@nestjs/common';
import { SessionSqlRepository } from '../session-sql.repository';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SessionsCleanupJob {
  constructor(private readonly sessionSqlRepository: SessionSqlRepository) {}

  // каждую ночь в 03:00 по времени Германии
  // 0 секунд, 0 минут, 3 часа, запускаем очистку.
  @Cron('0 0 3 * * *', {
    timeZone: 'Europe/Berlin',
  })
  async cleanup(): Promise<void> {
    console.log('Запустилась очистка сессий');
    await this.sessionSqlRepository.deleteInactiveSessions();
    console.log('Очистка сессий завершена');
  }
}

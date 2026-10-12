import { Injectable } from '@nestjs/common';
import { DeviceSessionViewDto } from '../../api/view-dto/device-session.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type SessionRow = {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
};

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // Возвращает список всех активных устройств пользователя.
  async getAllDevices(userId: string): Promise<DeviceSessionViewDto[]> {
    // Ищем все активные sessions пользователя.
    // exp > текущей даты означает, что session ещё не протухла.

    const result = await this.dataSource.query<SessionRow[]>(
      `
      SELECT d.ip, d."deviceName" as title, d."issuedAt" as "lastActiveDate", d.id as "deviceId"
      FROM public.devices as d
      WHERE d."userId" = $1
        AND d."deletedAt" IS NULL
        AND d."expirationDate" > NOW()
      `,
      [userId],
    );

    return result.map((session) => {
      return {
        ip: session.ip,
        title: session.title,
        lastActiveDate: session.lastActiveDate.toISOString(),
        deviceId: session.deviceId,
      };
    });
  }
}

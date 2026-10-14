import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateSessionDomainDto } from '../domain/dto/create-session.domain.dto';

type DeviceRow = {
  deviceId: string;
  userId: string;
  deviceName: string;
  ip: string;
  issuedAt: Date;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class SessionSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(session: CreateSessionDomainDto): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO devices (
        id,
        "userId",
        "deviceName",
        ip,
        "issuedAt",
        "expirationDate"              
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        session.deviceId, // Записываем deviceId в колонку id
        session.userId,
        session.deviceName,
        session.ip,
        session.issuedAt,
        session.expirationDate,
      ],
    );
  }

  async findActiveByDeviceId(deviceId: string): Promise<DeviceRow | null> {
    const result = await this.dataSource.query<DeviceRow[]>(
      `
      SELECT
        id AS "deviceId",
        "userId",
        "deviceName",
        ip,
        "issuedAt",
        "expirationDate",
        "createdAt",
        "updatedAt",
        "deletedAt"
      FROM public.devices 
      WHERE id = $1
        AND "deletedAt" IS NULL
        AND "expirationDate" > NOW()
      `,
      [deviceId],
    );
    return result[0] ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.devices 
      SET "deletedAt" = NOW(),
          "updatedAt" = NOW()
      WHERE id = $1
      AND "deletedAt" IS NULL 
      `,
      [sessionId],
    );
  }

  async updateRefreshToken(
    deviceId: string,
    issuedAt: Date,
    expirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.devices
      SET "issuedAt" = $1,
          "expirationDate" = $2,
          "updatedAt" = NOW()
      WHERE id = $3
        AND "deletedAt" IS NULL
        AND "expirationDate" > NOW()
      `,
      [issuedAt, expirationDate, deviceId],
    );
  }

  // Помечает удалёнными все device sessions текущего пользователя, кроме текущего устройства.
  // Используется для endpoint-а: DELETE /security/devices
  async deleteAllExceptCurrent({
    deviceId,
    userId,
  }: {
    deviceId: string;
    userId: string;
  }): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.devices
        SET "deletedAt" = NOW(),
            "updatedAt" = NOW()
        WHERE "userId" = $1
          AND id <> $2 -- <> означает «не равно»
          AND "deletedAt" IS NULL
      `,
      [userId, deviceId],
    );
  }

  // Полностью удаляет завершённые и истёкшие сессии.
  async deleteInactiveSessions(): Promise<void> {
    await this.dataSource.query(
      `
      DELETE FROM public.devices
      WHERE "deletedAt" IS NOT NULL
      OR "expirationDate" <= NOW()
      `,
    );
  }
}

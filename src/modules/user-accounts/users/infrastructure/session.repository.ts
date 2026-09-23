import { Injectable } from '@nestjs/common';
import { SessionDocument, SessionEntity } from '../domain/session.entity';
import type { SessionModelType } from '../domain/session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(SessionEntity.name)
    private readonly SessionModel: SessionModelType,
  ) {}

  async createSession(session: SessionEntity): Promise<void> {
    const sessionDocument = new this.SessionModel(session);
    await sessionDocument.save();
  }

  async saveSession(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return await this.SessionModel.findOne({ deviceId, deletedAt: null });
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
    await this.SessionModel.updateMany(
      {
        // Удаляет все device sessions текущего пользователя
        userId,
        // Но НЕ удаляем текущую session/device
        // device_id НЕ равен текущему deviceId
        deviceId: { $ne: deviceId },
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
    );
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { SessionEntity } from '../../domain/session.entity';
import type { SessionModelType } from '../../domain/session.entity';
import { Injectable } from '@nestjs/common';
import { DeviceSessionViewDto } from '../../api/view-dto/device-session.view-dto';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(SessionEntity.name) private SessionModel: SessionModelType,
  ) {}

  // Возвращает список всех активных устройств пользователя.
  async getAllDevices(userId: string): Promise<DeviceSessionViewDto[]> {
    // Ищем все активные sessions пользователя.
    // exp > текущей даты означает, что session ещё не протухла.
    const devices = await this.SessionModel.find({
      userId: userId,
      expirationDate: { $gt: new Date() },
      deletedAt: null,
    }).lean();

    // Преобразуем документы БД в View Model для ответа клиенту.
    return devices.map((d) => DeviceSessionViewDto.mapToView(d));
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { SessionEntity } from '../../domain/session.entity';

export class DeviceSessionViewDto {
  @ApiProperty({
    description: 'IP address of device during signing in',
  })
  ip: string;

  @ApiProperty({
    description:
      'Device name, for example Chrome 105, received from user-agent header',
  })
  title: string;

  @ApiProperty({
    description: 'Date of the last generating of refresh/access tokens',
    example: '2026-09-22T09:30:00.000Z',
  })
  lastActiveDate: string;

  @ApiProperty({
    description: 'Id of connected device session',
  })
  deviceId: string;

  static mapToView(session: SessionEntity): DeviceSessionViewDto {
    const dto = new this();

    dto.ip = session.ip;
    dto.deviceId = session.deviceId;
    dto.title = session.deviceName;
    dto.lastActiveDate = session.issuedAt.toISOString();

    return dto;
  }
}

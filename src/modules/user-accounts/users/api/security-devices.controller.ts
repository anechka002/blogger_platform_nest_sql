import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenAuthGuard } from '../../../../core/guards/bearer/refresh-token.auth.guard';
import { DeviceSessionViewDto } from './view-dto/device-session.view-dto';
import { RefreshTokenInfo } from './decorators/refresh-token-info.decorator';
import { RefreshTokenDto } from '../guards/dto/refresh-token.dto';
import { DeleteDeviceSessionCommand } from '../application/use-cases/devices/delete-device-session.use-case';
import { DeleteAllDevicesSessionsCommand } from '../application/use-cases/devices/delete-all-devices-sessions.use-case';
import { GetDevicesWithActiveSessionsSwagger } from './swagger/devices/get-all-devices.swagger.decorator';
import { DeleteAllDevicesSwagger } from './swagger/devices/delete-all-devices.swagger.decorator';
import { DeleteDeviceSessionSwagger } from './swagger/devices/delete-device-session.swagger.decorator';
import { SessionsSqlQueryRepository } from '../infrastructure/query/sessions-sql.query-repository';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private sessionSqlQueryRepository: SessionsSqlQueryRepository,
  ) {
    console.log('SecurityDevicesController created');
  }

  @GetDevicesWithActiveSessionsSwagger()
  @Get()
  async getAll(
    @RefreshTokenInfo() refreshTokenInfo: RefreshTokenDto,
  ): Promise<DeviceSessionViewDto[]> {
    return this.sessionSqlQueryRepository.getAllDevices(
      refreshTokenInfo.userId,
    );
  }

  @DeleteDeviceSessionSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':deviceId')
  deleteDeviceSession(
    @Param('deviceId') deviceId: string,
    @RefreshTokenInfo() refreshTokenInfo: RefreshTokenDto,
  ): Promise<void> {
    return this.commandBus.execute<DeleteDeviceSessionCommand, void>(
      new DeleteDeviceSessionCommand(deviceId, refreshTokenInfo.userId),
    );
  }

  @DeleteAllDevicesSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteAllDevicesSession(
    @RefreshTokenInfo() refreshTokenInfo: RefreshTokenDto,
  ): Promise<void> {
    return this.commandBus.execute<DeleteAllDevicesSessionsCommand, void>(
      new DeleteAllDevicesSessionsCommand(
        refreshTokenInfo.userId,
        refreshTokenInfo.deviceId,
      ),
    );
  }
}

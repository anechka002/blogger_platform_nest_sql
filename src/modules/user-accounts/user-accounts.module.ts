import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersController } from './users/api/users.controller';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/query/users.query-repository';
import { PasswordService } from './users/application/services/password.service';
import { AuthController } from './users/api/auth.controller';
import { AuthQueryRepository } from './users/infrastructure/query/auth.query-repository';
import { AuthService } from './users/application/services/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { LocalStrategy } from '../../core/guards/local/local.strategy';
import { JwtStrategy } from '../../core/guards/bearer/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { CreateUserUseCase } from './users/application/use-cases/admin/create-user.use-case';
import { DeleteUserUseCase } from './users/application/use-cases/admin/delete-user.use-case';
import { LoginUserUseCase } from './users/application/use-cases/public/login-user.use-case';
import { RegisterUserUseCase } from './users/application/use-cases/public/register-user.use-case';
import { ConfirmCodeUseCase } from './users/application/use-cases/public/confirm-code.use-case';
import { RegisterEmailResendingUseCase } from './users/application/use-cases/public/register-email-resending.use-case';
import { NewPasswordRecoveryUseCase } from './users/application/use-cases/public/new-password-recovery.use-case';
import { PasswordRecoveryUseCase } from './users/application/use-cases/public/password-recovery.use-case';
import { JwtAdapter } from './users/application/services/jwt/jwt.adapter';
import { UsersExternalQueryRepository } from './users/infrastructure/external-query/users.external-query-repository';
import { UserAccountsConfig } from './users/config/user-accounts.config';
import { SessionRepository } from './users/infrastructure/session.repository';
import { SessionEntity, SessionSchema } from './users/domain/session.entity';
import { DeleteAllDevicesSessionsUseCase } from './users/application/use-cases/devices/delete-all-devices-sessions.use-case';
import { DeleteDeviceSessionUseCase } from './users/application/use-cases/devices/delete-device-session.use-case';
import { SessionsQueryRepository } from './users/infrastructure/query/sessions.query-repository';
import { SecurityDevicesController } from './users/api/security-devices.controller';
import { RefreshTokenUseCase } from './users/application/use-cases/public/refresh-token.use-case';
import { RefreshTokenStrategy } from '../../core/guards/bearer/refresh-token.strategy';
import { LogoutUserUseCase } from './users/application/use-cases/public/logout-user.use-case';
import { UsersSqlQueryRepository } from './users/infrastructure/query/users-sql.query-repository';
import { UsersSqlRepository } from './users/infrastructure/users-sql.repository';
import { SessionSqlRepository } from './users/infrastructure/session-sql.repository';
import { SessionsSqlQueryRepository } from './users/infrastructure/query/sessions-sql.query-repository';
import { AuthSqlQueryRepository } from './users/infrastructure/query/auth-sql.query-repository';
import { SessionsCleanupJob } from './users/infrastructure/jobs/session-cleanup.job';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: SessionEntity.name, schema: SessionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    AuthService,
    AuthQueryRepository,
    AuthSqlQueryRepository,

    UsersExternalQueryRepository,
    UsersQueryRepository,
    UsersRepository,
    UsersSqlQueryRepository,
    UsersSqlRepository,

    SessionRepository,
    SessionsQueryRepository,
    SessionSqlRepository,
    SessionsSqlQueryRepository,

    SessionsCleanupJob,

    PasswordService,

    CreateUserUseCase,
    DeleteUserUseCase,
    LoginUserUseCase,
    RegisterUserUseCase,
    ConfirmCodeUseCase,
    RegisterEmailResendingUseCase,
    NewPasswordRecoveryUseCase,
    PasswordRecoveryUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,

    DeleteAllDevicesSessionsUseCase,
    DeleteDeviceSessionUseCase,

    LocalStrategy,
    JwtStrategy,
    JwtAdapter,
    RefreshTokenStrategy,

    UserAccountsConfig,
  ],
  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule {}

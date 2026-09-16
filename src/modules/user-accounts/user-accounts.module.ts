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
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './users/application/use-cases/admin/create-user.use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user.use-case';
import { LoginUserUseCase } from './users/application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './users/application/use-cases/register-user.use-case';
import { ConfirmCodeUseCase } from './users/application/use-cases/confirm-code.use-case';
import { RegisterEmailResendingUseCase } from './users/application/use-cases/register-email-resending.use-case';
import { NewPasswordRecoveryUseCase } from './users/application/use-cases/new-password-recovery.use-case';
import { PasswordRecoveryUseCase } from './users/application/use-cases/password-recovery.use-case';
import { JwtAdapter } from '../../core/jwt/jwt.adapter';
import { UsersExternalQueryRepository } from './users/infrastructure/external-query/users.external-query-repository';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    AuthService,
    AuthQueryRepository,

    UsersExternalQueryRepository,
    UsersQueryRepository,
    UsersRepository,

    PasswordService,

    CreateUserUseCase,
    DeleteUserUseCase,
    LoginUserUseCase,
    RegisterUserUseCase,
    ConfirmCodeUseCase,
    RegisterEmailResendingUseCase,
    NewPasswordRecoveryUseCase,
    PasswordRecoveryUseCase,

    LocalStrategy,
    JwtStrategy,
    JwtAdapter,
  ],
  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule {}

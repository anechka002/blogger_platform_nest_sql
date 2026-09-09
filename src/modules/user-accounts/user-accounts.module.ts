import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersController } from './users/api/users.controller';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersService } from './users/application/users.service';
import { UsersQueryRepository } from './users/infrastructure/query/users.query-repository';
import { BcryptService } from './users/application/bcrypt.service';
import { AuthController } from './users/api/auth.controller';
import { AuthQueryRepository } from './users/infrastructure/query/auth.query-repository';
import { AuthService } from './users/application/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { LocalStrategy } from './users/guards/local/local.strategy';
import { JwtStrategy } from './users/guards/bearer/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    AuthService,
    AuthQueryRepository,

    UsersQueryRepository,
    UsersRepository,
    UsersService,

    BcryptService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class UserAccountsModule {}

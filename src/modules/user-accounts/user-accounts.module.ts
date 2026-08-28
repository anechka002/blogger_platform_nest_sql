import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersController } from './users/api/users.controller';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersService } from './users/application/users.service';
import { UsersQueryRepository } from './users/infrastructure/query/users.query-repository';
import { BcryptService } from './users/application/bcrypt.service';
import { AuthController } from './auth/api/auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersQueryRepository,
    UsersRepository,
    UsersService,
    BcryptService,
  ],
})
export class UserAccountsModule {}

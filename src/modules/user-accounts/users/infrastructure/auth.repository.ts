import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
}

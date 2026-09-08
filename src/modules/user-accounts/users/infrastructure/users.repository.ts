import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    // Найди документ с этим id, но только если он не помечен как удалённый.
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findByRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });
  }

  async create(dto: CreateUserDomainDto): Promise<UserDocument> {
    const user = this.UserModel.createForRegistration(dto);

    await user.save();

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email });
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return user;
  }
}

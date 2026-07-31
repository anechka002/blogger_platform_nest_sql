import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    // Найди документ с этим id, но только если он не помечен как удалённый.
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async create(user: User): Promise<UserDocument> {
    const userDocument = new this.UserModel(user);
    await userDocument.save();
    return userDocument;
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return user;
  }
}

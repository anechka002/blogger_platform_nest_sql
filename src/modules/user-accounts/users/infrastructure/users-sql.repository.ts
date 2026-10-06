import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRow } from './query/users-sql.query-repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersSqlRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findById(id: string): Promise<UserRow | null> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT *
      FROM public.users as u
      WHERE u."userId" = $1
        AND u."deletedAt" IS NULL
    `,
      [id],
    );

    console.log(result[0]);
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT *
      FROM public.users as u
      WHERE u.email = $1
        AND u."deletedAt" IS NULL
    `,
      [email],
    );

    console.log(result[0]);
    return result[0] ?? null;
  }

  async findByLogin(login: string): Promise<UserRow | null> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT *
      FROM public.users as u
      WHERE u.login = $1
        AND u."deletedAt" IS NULL
    `,
      [login],
    );

    return result[0] ?? null;
  }

  async create(user: User): Promise<UserRow> {
    const result = await this.dataSource.query<UserRow[]>(
      `
        INSERT INTO users (login, email, "passwordHash")
        VALUES ($1, $2, $3)
          RETURNING *;
    `,
      [user.login, user.email, user.passwordHash],
    );
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(
      `
      -- измени запись в users
      UPDATE public.users 
      -- поставь текущее время в deletedAt.
      SET "deletedAt" = NOW(),
      "updatedAt" = NOW()
      -- только пользователю с нужным id.
      WHERE "userId" = $1
      -- и только если он ещё не удалён.
      AND "deletedAt" IS NULL
      `,
      [id],
    );
  }

  // async findById(id: Types.ObjectId): Promise<UserDocument | null> {
  //   // Найди документ с этим id, но только если он не помечен как удалённый.
  //   return this.UserModel.findOne({
  //     _id: id,
  //     deletedAt: null,
  //   });
  // }
  //
  // async save(user: UserDocument) {
  //   await user.save();
  // }
  //
  // async findByConfirmationCode(code: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({
  //     'emailConfirmation.confirmationCode': code,
  //   });
  // }
  //
  // async findByRecoveryCode(code: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({
  //     'passwordRecovery.recoveryCode': code,
  //   });
  // }
  //
  // async create(user: User): Promise<UserDocument> {
  //   const userDocument = new this.UserModel(user);
  //   await userDocument.save();
  //   return userDocument;
  // }
  //
  // async findByEmail(email: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({ email });
  // }
  //
  // async findByLogin(login: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({ login });
  // }
  //
  // async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({
  //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  //     deletedAt: null,
  //   });
  // }
  //
  // async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
  //   const user = await this.findById(id);
  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'User not found',
  //     });
  //   }
  //   return user;
  // }
}

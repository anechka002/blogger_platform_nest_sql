import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRow } from './query/users-sql.query-repository';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';

type EmailConfirmationRow = {
  userId: string;
  confirmationCode: string;
  confirmationExpirationDate: Date | null;
  isConfirmed: boolean;
};

type UserWithEmailConfirmationRow = UserRow & {
  confirmationCode: string | null;
  confirmationExpirationDate: Date | null;
  isConfirmed: boolean;
};

type UserAccountStateRow = {
  id: string;
  userId: string;
  confirmationCode: string | null;
  confirmationExpirationDate: Date | null;
  isConfirmed: boolean;
  recoveryCode: string;
  recoveryExpirationDate: Date | null;
};

@Injectable()
export class UsersSqlRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findById(id: string): Promise<UserRow | null> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT *
      FROM public.users as u
      WHERE u.id = $1
        AND u."deletedAt" IS NULL
    `,
      [id],
    );

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

  async createUserWithAccountState(
    user: CreateUserDomainDto,
    isConfirmed: boolean = false,
    confirmationCode: string | null = null,
    confirmationExpirationDate: Date | null = null,
  ): Promise<UserRow> {
    return this.dataSource.transaction(async (manager) => {
      // Создаём пользователя
      const result = await manager.query<UserRow[]>(
        `
          INSERT INTO users (login, email, "passwordHash")
          VALUES ($1, $2, $3)
            RETURNING *;
        `,
        [user.login, user.email, user.passwordHash],
      );

      const createdUser = result[0];

      // Создаём связанное состояние аккаунта
      await manager.query(
        `
          INSERT INTO user_account_state ("userId", "isConfirmed", "confirmationCode", "confirmationExpirationDate")
          VALUES ($1, $2, $3, $4)
        `,
        [
          createdUser.id,
          isConfirmed,
          confirmationCode,
          confirmationExpirationDate,
        ],
      );
      return createdUser;
    });
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Помечаем пользователя удалённым
      await manager.query(
        `
      -- измени запись в users
      UPDATE public.users 
      -- поставь текущее время в deletedAt.
      SET "deletedAt" = NOW(), "updatedAt" = NOW()
      -- только пользователю с нужным id.
      WHERE id = $1
      -- и только если он ещё не удалён.
      AND "deletedAt" IS NULL
      `,
        [id],
      );

      // Очищаем коды и сроки их действия
      await manager.query(
        `
        UPDATE public.user_account_state 
        SET "confirmationCode" = NULL, 
            "confirmationExpirationDate" = NULL,
            "recoveryCode" = NULL,
            "recoveryExpirationDate" = NULL
        WHERE "userId" = $1
        `,
        [id],
      );
    });
  }

  // Находим активного пользователя по email вместе с данными подтверждения.
  // Возвращает null, если пользователь или запись состояния аккаунта не найдены.
  async findUserWithEmailConfirmationByEmail(
    email: string,
  ): Promise<UserWithEmailConfirmationRow | null> {
    const result = await this.dataSource.query<UserWithEmailConfirmationRow[]>(
      `
      SELECT u.*, uas."confirmationCode", uas."confirmationExpirationDate", uas."isConfirmed"
      FROM public.users as u
      INNER JOIN public.user_account_state as uas
      ON u.id = uas."userId"
      WHERE u.email = $1
        AND u."deletedAt" IS NULL
    `,
      [email],
    );

    return result[0] ?? null;
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<EmailConfirmationRow | null> {
    const result: EmailConfirmationRow[] = await this.dataSource.query(
      `
      SELECT *
      FROM public.user_account_state as uas
      WHERE uas."confirmationCode" = $1
      `,
      [code],
    );
    return result[0] ?? null;
  }

  async confirmEmail(code: string): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.user_account_state 
      SET "isConfirmed" = true
      WHERE "confirmationCode" = $1
      `,
      [code],
    );
  }

  async refreshEmailConfirmation(
    userId: string,
    newConfirmationCode: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.user_account_state as uas
      SET "confirmationCode" = $1,
          "confirmationExpirationDate" = $2
      WHERE uas."userId" = $3
      `,
      [newConfirmationCode, newExpirationDate, userId],
    );
  }

  async refreshRecoveryCode(
    userId: string,
    newRecoveryCode: string,
    newRecoveryExpirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.user_account_state as uas
      SET "recoveryCode" = $1,
          "recoveryExpirationDate" = $2
      WHERE uas."userId" = $3
      `,
      [newRecoveryCode, newRecoveryExpirationDate, userId],
    );
  }

  async findByRecoveryCode(code: string): Promise<UserAccountStateRow | null> {
    const result: UserAccountStateRow[] = await this.dataSource.query(
      `
      SELECT *
      FROM public.user_account_state as uas
      WHERE uas."recoveryCode" = $1
      `,
      [code],
    );
    return result[0] ?? null;
  }

  async completePasswordRecovery(
    userId: string,
    newPasswordHash: string,
  ): Promise<void> {
    // Меняем пароль пользователя
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          UPDATE public.users
          SET "passwordHash" = $1
          WHERE id = $2
        `,
        [newPasswordHash, userId],
      );

      // Делаем код восстановления недействительным
      // Очищаем использованный код и дату
      await manager.query(
        `
      UPDATE public.user_account_state
      SET "recoveryCode" = NULL,
          "recoveryExpirationDate" = NULL
      WHERE "userId" = $1
      `,
        [userId],
      );
    });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserRow | null> {
    const result = await this.dataSource.query<UserRow[]>(
      `
     SELECT *
     FROM public.users as u
     WHERE (u.login = $1 OR u.email = $1)
     AND "deletedAt" IS NULL
     `,
      [loginOrEmail],
    );
    return result[0] ?? null;
  }
}

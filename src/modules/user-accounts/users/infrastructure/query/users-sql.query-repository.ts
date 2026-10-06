import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export type UserRow = {
  userId: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type UsersQueryResult = {
  users: UserRow[];
  totalCount: number;
};

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // Найти user по id
  async getByIdOrNotFoundFail(id: string): Promise<UserRow> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT *
      FROM public.users as u
      WHERE u."userId" = $1
        AND u."deletedAt" IS NULL
    `,
      [id],
    );

    const user = result[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  // Найти список пользователей согласно переданным параметрам.
  async findAllUsers(query: GetUsersQueryParams): Promise<UsersQueryResult> {
    // значение для поиска по login.
    // % позволяет искать совпадение в любой части строки.
    const loginTerm = query.searchLoginTerm
      ? `%${query.searchLoginTerm}%`
      : null;

    // значение для поиска по email.
    const emailTerm = query.searchEmailTerm
      ? `%${query.searchEmailTerm}%`
      : null;

    // Получаем пользователей, подходящих под фильтры.
    const users = await this.dataSource.query<UserRow[]>(
      `
        SELECT "userId", login, email, "createdAt"
        FROM public.users as u
        -- Берём только неудалённых пользователей.
        WHERE u."deletedAt" IS NULL
        AND (
            -- Если передан loginTerm — ищем совпадение по login.
            ($1::text IS NOT NULL AND u.login ILIKE $1)
          OR
            -- Если передан emailTerm — ищем совпадение по email.
            ($2::text IS NOT NULL AND u.email ILIKE $2)
          OR
            -- Если фильтры не переданы — подходят все неудалённые пользователи.
            ($1::text IS NULL AND $2::text IS NULL)
        )
        -- Сортируем по выбранному полю и направлению.
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        -- Ограничиваем количество пользователей на странице.
        LIMIT $3
        -- Пропускаем пользователей с предыдущих страниц.
        OFFSET $4
      `,
      // $1, $2, $3, $4
      [loginTerm, emailTerm, query.pageSize, query.calculateSkip()],
    );

    // Считаем общее количество пользователей, подходящих под те же фильтры.
    // LIMIT и OFFSET здесь не нужны, потому что считаем все найденные записи.
    const totalCountResult = await this.dataSource.query<
      { totalCount: string }[]
    >(
      `
             SELECT COUNT(*) AS "totalCount"
             FROM public.users as u
             WHERE u."deletedAt" IS NULL
               AND (
               ($1::text IS NOT NULL AND u.login ILIKE $1)
                 OR
               ($2::text IS NOT NULL AND u.email ILIKE $2)
                 OR
               ($1::text IS NULL AND $2::text IS NULL)
               )
      `,
      [loginTerm, emailTerm],
    );

    // dataSource.query возвращает массив строк,
    // а COUNT из PostgreSQL приходит строкой, поэтому превращаем его в number.
    const totalCount = Number(totalCountResult[0].totalCount);

    return { users, totalCount };
  }

  // Найти user по id
  // async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
  //   const user = await this.UserModel.findOne({
  //     _id: id,
  //     deletedAt: null,
  //   });
  //
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //
  //   return UserViewDto.mapToView(user);
  // }

  // Найти список пользователей согласно переданным параметрам.
  // async findAllUsers(
  //   query: GetUsersQueryParams,
  // ): Promise<PaginationViewDto<UserViewDto>> {
  //   // мы хотим найти только пользователей, которые не удалены.
  //   const filter: QueryFilter<User> = { deletedAt: null };
  //
  //   if (query.searchLoginTerm) {
  //     // Мы проверяем, существует ли в фильтре массив $or. Если существует — используем его, если нет — создаём пустой массив.
  //     filter.$or = filter.$or || [];
  //     filter.$or.push({
  //       login: { $regex: query.searchLoginTerm, $options: 'i' },
  //     });
  //   }
  //
  //   if (query.searchEmailTerm) {
  //     filter.$or = filter.$or || [];
  //     filter.$or.push({
  //       email: { $regex: query.searchEmailTerm, $options: 'i' },
  //     });
  //   }
  //
  //   const users = await this.UserModel.find(filter)
  //     .skip(query.calculateSkip())
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .limit(query.pageSize);
  //
  //   const totalCount = await this.UserModel.countDocuments(filter);
  //
  //   const items = users.map((user) => {
  //     return UserViewDto.mapToView(user);
  //   });
  //
  //   // Мы передаём данные, из которых можно посчитать количество страниц, а сам расчёт прячем внутри mapToView.
  //   return PaginationViewDto.mapToView({
  //     items,
  //     totalCount,
  //     pageSize: query.pageSize,
  //     page: query.pageNumber,
  //   });
  // }
}

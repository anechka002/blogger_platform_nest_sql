import { Injectable } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export type BlogRow = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogsQueryResult = {
  blogs: BlogRow[];
  totalCount: number;
};

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllBlogs(query: GetBlogsQueryParams): Promise<BlogsQueryResult> {
    const nameTerm = query.searchNameTerm ? `%${query.searchNameTerm}%` : null;

    const blogs = await this.dataSource.query<BlogRow[]>(
      `
      SELECT id, name, description, "websiteUrl", "createdAt", "isMembership" 
      FROM public.blogs as b
      WHERE b."deletedAt" IS NULL
      AND (
      -- Если передан nameTerm — ищем совпадение по name.
        ($1::text IS NULL OR b.name ILIKE $1)
      )
      -- Сортируем по выбранному полю и направлению.
      ORDER BY "${query.sortBy}" ${query.sortDirection}
      -- Ограничиваем количество пользователей на странице.
      LIMIT $2
      -- Пропускаем пользователей с предыдущих страниц.
      OFFSET $3
      `,
      [nameTerm, query.pageSize, query.calculateSkip()],
    );

    // Считаем общее количество blogs, подходящих под те же фильтры.
    // LIMIT и OFFSET здесь не нужны, потому что считаем все найденные записи.
    const totalCountResult = await this.dataSource.query<
      { totalCount: string }[]
    >(
      `
      SELECT COUNT(*) as "totalCount"
      FROM public.blogs as b
      WHERE b."deletedAt" IS NULL
      AND (
        ($1::text IS NULL OR b.name ILIKE $1)
        )
      `,
      [nameTerm],
    );

    // dataSource.query возвращает массив строк,
    // а COUNT из PostgreSQL приходит строкой, поэтому превращаем его в number.
    const totalCount = Number(totalCountResult[0].totalCount);

    return { blogs, totalCount };
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogRow> {
    const result = await this.dataSource.query<BlogRow[]>(
      `
      SELECT * 
      FROM blogs 
      WHERE id=$1
      AND "deletedAt" IS NULL
      `,
      [id],
    );

    const blog = result[0];
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return blog;
  }
}

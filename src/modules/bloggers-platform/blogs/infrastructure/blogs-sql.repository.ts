import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogRow } from './query/blogs-sql.query-repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findOrNotFoundFail(id: string): Promise<BlogRow> {
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

  async create(blog: CreateBlogDto): Promise<string> {
    const result = await this.dataSource.query<{ id: string }[]>(
      `
      INSERT INTO public.blogs (
         name,
         description,
         "websiteUrl"                       
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [blog.name, blog.description, blog.websiteUrl],
    );

    return result[0].id;
  }

  async update(id: string, dto: UpdateBlogDto): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.blogs
      SET name = $1, description = $2, "websiteUrl" = $3, "updatedAt" = NOW()
      WHERE id = $4
        AND "deletedAt" IS NULL
      `,
      [dto.name, dto.description, dto.websiteUrl, id],
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.blogs
        -- поставь текущее время в deletedAt.
        SET "deletedAt" = NOW(), "updatedAt" = NOW()
        -- только пользователю с нужным id.
        WHERE id = $1
          AND "deletedAt" IS NULL
      `,
      [id],
    );
  }
}

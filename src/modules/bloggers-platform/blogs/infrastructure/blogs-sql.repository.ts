import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogRow } from './query/blogs-sql.query-repository';

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

  // async create(blog: Blog): Promise<BlogDocument> {
  //   const blogDocument = new this.BlogModel(blog);
  //   return await blogDocument.save();
  // }
  //
  // async save(blog: BlogDocument) {
  //   await blog.save();
  // }
}

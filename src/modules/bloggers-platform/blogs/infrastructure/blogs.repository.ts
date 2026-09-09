import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsRepository {
  //инжектирование модели через DI
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {
    console.log('BlogsRepository');
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return blog;
  }

  async create(blog: Blog): Promise<BlogDocument> {
    const blogDocument = new this.BlogModel(blog);
    return await blogDocument.save();
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}

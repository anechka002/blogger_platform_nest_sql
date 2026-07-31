import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {
    console.log('BlogsRepository');
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return blog;
  }

  async create(blog: Blog): Promise<BlogDocument> {
    const blogDocument = new this.BlogModel(blog);
    await blogDocument.save();
    return blogDocument;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}

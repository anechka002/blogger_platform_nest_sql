import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { CreateBlogDomainDto } from '../domain/dto/create-blog.domain.dto';

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

  async create(dto: CreateBlogDomainDto): Promise<BlogDocument> {
    const blog = this.BlogModel.createInstanceBlog(dto);

    await blog.save();

    return blog;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}

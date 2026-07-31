import { Injectable } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {
    console.log('blogsService');
  }
  async createBlog(dto: CreateBlogDto): Promise<string> {
    const { name, websiteUrl, description } = dto;
    const blog = Blog.createInstanceBlog({ name, websiteUrl, description });
    const savedBlog = await this.blogsRepository.create(blog);
    return savedBlog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.update(dto);
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }
}

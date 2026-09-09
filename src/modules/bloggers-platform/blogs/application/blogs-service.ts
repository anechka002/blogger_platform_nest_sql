import { Injectable } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { Post } from '../../posts/domain/post.entity';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
    console.log('BlogsService');
  }
  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = Blog.createInstanceBlog({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

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

  async createPostForBlog(
    blogId: string,
    body: CreatePostForBlogDto,
  ): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);

    const newPost = Post.createInstancePost({
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId,
      blogName: blog.name,
    });

    const savedPost = await this.postsRepository.create(newPost);
    return savedPost._id.toString();
  }
}

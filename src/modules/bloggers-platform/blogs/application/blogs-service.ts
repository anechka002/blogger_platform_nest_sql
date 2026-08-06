import { Injectable } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { Post } from '../../posts/domain/post.entity';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
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
    await this.postsRepository.save(savedPost);
    return savedPost._id.toString();
  }
}

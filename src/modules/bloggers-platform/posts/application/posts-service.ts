import { Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { Post } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {
    console.log('PostsService');
  }
  async createPost(dto: CreatePostDto): Promise<string> {
    const { blogId, shortDescription, title, content } = dto;

    const foundBlog = await this.blogsRepository.findOrNotFoundFail(blogId);

    const post = Post.createInstancePost({
      blogId,
      shortDescription,
      title,
      content,
      blogName: foundBlog.name,
    });
    const savedPost = await this.postsRepository.create(post);
    return savedPost._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<string> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}

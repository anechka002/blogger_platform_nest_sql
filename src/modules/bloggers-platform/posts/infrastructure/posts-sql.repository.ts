import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostRow } from './query/posts-sql.query-repository';
import {
  CreatePostForBlogDto,
  UpdatePostForBlogDto,
} from '../../blogs/dto/create-post-for-blog.dto';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findOrNotFoundFail(id: string): Promise<PostRow> {
    const result = await this.dataSource.query<PostRow[]>(
      `
      SELECT *
      FROM posts
      WHERE id=$1
      AND "deletedAt" IS NULL
      `,
      [id],
    );

    const post = result[0];

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return post;
  }

  async createPostForBlog(
    blogId: string,
    post: CreatePostForBlogDto,
  ): Promise<string> {
    const result = await this.dataSource.query<{ id: string }[]>(
      `
      INSERT INTO public.posts (
        title, 
        "shortDescription", 
        content, 
        "blogId"
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [post.title, post.shortDescription, post.content, blogId],
    );
    return result[0].id;
  }

  async updatePostForBlog(
    blogId: string,
    postId: string,
    post: UpdatePostForBlogDto,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.posts
      SET title = $1, "shortDescription" = $2, content = $3, "updatedAt" = NOW()
      WHERE id=$4
        AND "blogId" = $5
        AND "deletedAt" IS NULL
      `,
      [post.title, post.shortDescription, post.content, postId, blogId],
    );
  }

  async deletePostForBlog(blogId: string, postId: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.posts
        -- поставь текущее время в deletedAt.
        SET "deletedAt" = NOW(), "updatedAt" = NOW()
        -- только посту с нужным id.
        WHERE id = $1
          AND "blogId" = $2
          AND "deletedAt" IS NULL
      `,
      [postId, blogId],
    );
  }
}

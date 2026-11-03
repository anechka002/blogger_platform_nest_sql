import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCommentDomainDto } from '../domain/dto/create-comment.domain.dto';
import { CommentRow } from './query/comments-sql.query-repository';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createComment(comment: CreateCommentDomainDto): Promise<string> {
    const result = await this.dataSource.query<{ id: string }[]>(
      `
      INSERT INTO public.comments ("userId", "postId", content)
      VALUES($1, $2, $3)
      RETURNING id;
      `,
      [comment.userId, comment.postId, comment.content],
    );

    return result[0].id;
  }

  async findById(id: string): Promise<CommentRow | null> {
    const result = await this.dataSource.query<CommentRow[]>(
      `
      SELECT * 
      FROM public.comments
      WHERE id = $1
        AND "deletedAt" IS NULL
      `,
      [id],
    );
    return result[0] ?? null;
  }

  async updateComment(id: string, content: string): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.comments 
      SET content = $1, "updatedAt" = NOW()
      WHERE id = $2
      AND "deletedAt" IS NULL
      `,
      [content, id],
    );
  }

  async deleteComment(id: string): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.comments 
      SET "deletedAt" = NOW(), "updatedAt" = NOW()
      WHERE id = $1
      AND "deletedAt" IS NULL
      `,
      [id],
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../core/enum/like-status';

export type CommentLikeRow = {
  id: string;
  commentId: string;
  userId: string;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CommentLikesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findReaction({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<CommentLikeRow | null> {
    const result = await this.dataSource.query<CommentLikeRow[]>(
      `
        SELECT *
        FROM comment_likes as cl
        WHERE cl."commentId" = $1
            AND cl."userId" = $2
      `,
      [commentId, userId],
    );

    return result[0] ?? null;
  }

  async createReaction(reaction: {
    commentId: string;
    userId: string;
    status: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.comment_likes (
      "commentId",
      "userId",
      status                             
    )
    VALUES ($1, $2, $3)
    `,
      [reaction.commentId, reaction.userId, reaction.status],
    );
  }

  async deleteReaction({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<void> {
    await this.dataSource.query(
      `
        DELETE FROM public.comment_likes
        WHERE "commentId" = $1
          AND "userId" = $2
      `,
      [commentId, userId],
    );
  }

  async updateReaction(reaction: {
    commentId: string;
    userId: string;
    status: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.comment_likes
      SET status = $1, "updatedAt" = NOW()  
      WHERE "commentId" = $2
        AND "userId" = $3
      `,
      [reaction.status, reaction.commentId, reaction.userId],
    );
  }
}

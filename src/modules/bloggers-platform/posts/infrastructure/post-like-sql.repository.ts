import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../core/enum/like-status';

export type PostLikeRow = {
  id: string;
  postId: string;
  userId: string;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PostLikesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findReaction({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<PostLikeRow | null> {
    const result = await this.dataSource.query<PostLikeRow[]>(
      `
      SELECT *
      FROM post_likes as pl
      WHERE pl."postId" = $1
        AND pl."userId" = $2
      `,
      [postId, userId],
    );

    return result[0] ?? null;
  }

  async createReaction(reaction: {
    postId: string;
    userId: string;
    status: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.post_likes (
      "postId",
      "userId",
      status                             
    )
    VALUES ($1, $2, $3)
    `,
      [reaction.postId, reaction.userId, reaction.status],
    );
  }

  async deleteReaction({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<void> {
    await this.dataSource.query(
      `
      DELETE FROM public.post_likes 
      WHERE "postId" = $1
        AND "userId" = $2
      `,
      [postId, userId],
    );
  }

  async updateReaction(reaction: {
    postId: string;
    userId: string;
    status: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.post_likes
      SET status = $1, "updatedAt" = NOW()  
      WHERE "postId" = $2
        AND "userId" = $3
      `,
      [reaction.status, reaction.postId, reaction.userId],
    );
  }
}

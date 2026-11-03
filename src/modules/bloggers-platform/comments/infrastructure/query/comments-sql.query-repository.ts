import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { LikeStatus } from '../../../../../core/enum/like-status';

export type CommentRow = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CommentWithAuthorRow = CommentRow & {
  userLogin: string;
};

export type CommentWithAuthorAndStatusRow = CommentWithAuthorRow & {
  myStatus: LikeStatus;
};

export type CommentWithLikesRow = CommentWithAuthorAndStatusRow & {
  likesCount: number;
  dislikesCount: number;
};

export type CommentsQueryResult = {
  comments: CommentWithLikesRow[];
  totalCount: number;
};

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentWithLikesRow> {
    const result = await this.dataSource.query<CommentWithAuthorAndStatusRow[]>(
      `
      SELECT c.*, u.login as "userLogin", COALESCE(cl.status::text, 'None') AS "myStatus"
      FROM public.comments as c
      JOIN public.users as u ON u.id = c."userId"
      LEFT JOIN public.comment_likes as cl ON cl."commentId" = c.id AND cl."userId" = $2
      WHERE c.id = $1
        AND c."deletedAt" IS NULL
      `,
      [id, userId ?? null],
    );

    const comment = result[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    // Считаем реакции на найденный пост.
    const counts = await this.dataSource.query<
      {
        likesCount: string;
        dislikesCount: string;
      }[]
    >(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = 'Like') AS "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') AS "dislikesCount"
      FROM public.comment_likes AS cl
      WHERE cl."commentId" = $1
      `,
      [id],
    );

    return {
      ...comment,
      likesCount: Number(counts[0].likesCount),
      dislikesCount: Number(counts[0].dislikesCount),
    };
  }

  async findCommentsByPostId(
    postId: string,
    query: GetCommentsQueryParams,
    userId?: string,
  ): Promise<CommentsQueryResult> {
    // Получаем страницу неудалённых комментариев и логины их авторов.
    const comments = await this.dataSource.query<
      CommentWithAuthorAndStatusRow[]
    >(
      `
      SELECT c.*, u.login as "userLogin", COALESCE(cl.status::text, 'None') AS "myStatus"
      FROM public.comments as c
      JOIN public.users as u ON u.id = c."userId"
      LEFT JOIN public.comment_likes as cl ON cl."commentId" = c.id AND cl."userId" = $4
      WHERE c."postId" = $1
        AND c."deletedAt" IS NULL
      ORDER BY c."${query.sortBy}" ${query.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [postId, query.pageSize, query.calculateSkip(), userId ?? null],
    );

    // Считаем все подходящие комментарии без пагинации.
    const countResult = await this.dataSource.query<{ totalCount: string }[]>(
      `
      SELECT COUNT(*) as "totalCount"
      FROM public.comments as c
      JOIN public.users as u ON u.id = c."userId"
      WHERE c."postId" = $1
      AND c."deletedAt" IS NULL
      `,
      [postId],
    );

    const totalCount = Number(countResult[0].totalCount);

    // Собираем ID только тех comments, которые попали на текущую страницу.
    const commentsIds = comments.map((comment) => comment.id);

    // Одним запросом считаем лайки и дизлайки для comments страницы.
    const likesCounts = await this.dataSource.query<
      {
        commentId: string;
        likesCount: string;
        dislikesCount: string;
      }[]
    >(
      `
      SELECT "commentId", 
        COUNT(*) FILTER (WHERE status = 'Like') as "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') as "dislikesCount"
      FROM public.comment_likes
      WHERE "commentId" = ANY($1::uuid[])
      GROUP BY "commentId"
      `,
      [commentsIds],
    );

    const commentsWithLikesResult = comments.map((comment) => {
      const counts = likesCounts.find((row) => row.commentId === comment.id);

      return {
        ...comment,
        likesCount: Number(counts?.likesCount ?? 0),
        dislikesCount: Number(counts?.dislikesCount ?? 0),
      };
    });

    return { comments: commentsWithLikesResult, totalCount };
  }
}

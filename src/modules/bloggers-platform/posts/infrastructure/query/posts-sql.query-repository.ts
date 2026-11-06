import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogRow } from '../../../blogs/infrastructure/query/blogs-sql.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostSortBy } from '../../api/input-dto/post-sort-by';
import { LikeStatus } from '../../../../../core/enum/like-status';

export type PostRow = {
  id: string;
  blogId: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewestLikeRow = {
  addedAt: Date;
  login: string;
  userId: string;
};

type PostWithStatusRow = PostRow & { myStatus: LikeStatus };

export type PostWithBlogNameRow = PostRow & {
  blogName: string;
};

export type PostWithBlogNameAndStatusRow = PostWithBlogNameRow & {
  myStatus: LikeStatus;
};

export type PostWithLikesRow = PostWithBlogNameAndStatusRow & {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikeRow[];
};

export type PostsQueryResult = {
  posts: PostWithLikesRow[];
  totalCount: number;
};

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllPosts(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PostsQueryResult> {
    // Название блога берём из blogs, остальные поля — из posts.
    const sortColumn =
      query.sortBy === PostSortBy.BlogName ? 'b.name' : `p."${query.sortBy}"`;

    const posts = await this.dataSource.query<PostWithBlogNameAndStatusRow[]>(
      `
      SELECT p.id, p.title, p."shortDescription", p.content, p."createdAt", p."blogId", b.name as "blogName", COALESCE(pl.status::text, 'None') AS "myStatus"
      FROM public.posts as p
      JOIN public.blogs as b ON b.id = p."blogId"
      LEFT JOIN public.post_likes as pl ON pl."postId" = p.id AND pl."userId" = $3
      WHERE p."deletedAt" IS NULL
        AND b."deletedAt" IS NULL
      -- Сортируем по выбранному полю и направлению.
      ORDER BY ${sortColumn} ${query.sortDirection}
      LIMIT $1
      OFFSET $2
      `,
      [query.pageSize, query.calculateSkip(), userId ?? null],
    );

    // Считаем все посты с теми же условиями, без пагинации.
    const totalCountResult = await this.dataSource.query<
      { totalCount: string }[]
    >(
      `
      SELECT COUNT(*) AS "totalCount"
      FROM public.posts as p
      JOIN public.blogs as b ON b.id = p."blogId"
      WHERE p."deletedAt" IS NULL
      AND b."deletedAt" IS NULL
      `,
    );

    // dataSource.query возвращает массив строк,
    // а COUNT из PostgreSQL приходит строкой, поэтому превращаем его в number.
    const totalCount = Number(totalCountResult[0].totalCount);

    // Собираем ID только тех постов, которые попали на текущую страницу.
    const postIds = posts.map((post) => post.id);

    // Одним запросом считаем лайки и дизлайки для постов страницы.
    const likesCounts = await this.dataSource.query<
      {
        postId: string;
        likesCount: string;
        dislikesCount: string;
      }[]
    >(
      `
      SELECT 
        "postId", 
        COUNT(*) FILTER (WHERE status = 'Like') as "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') as "dislikesCount"
      FROM public.post_likes
      WHERE "postId" = ANY($1::uuid[])
      GROUP BY "postId"
      `,
      [postIds],
    );
    // ANY выбирает реакции на любой ID из переданного массива.
    // GROUP BY считает реакции отдельно для каждого поста.

    const newestLikes = await this.dataSource.query<
      (NewestLikeRow & { postId: string })[]
    >(
      `
      WITH ranked_likes AS (
        SELECT pl."postId",
               pl."updatedAt" AS "addedAt",
               pl."userId",
               u.login,
               ROW_NUMBER() OVER (
                 PARTITION BY pl."postId"
                 ORDER BY pl."updatedAt" DESC, pl.id DESC
               ) AS position
        FROM public.post_likes AS pl
        JOIN public.users AS u ON u.id = pl."userId"
        WHERE pl."postId" = ANY($1::uuid[])
          AND pl.status = 'Like'
      )
      SELECT "postId", "addedAt", "userId", login
      FROM ranked_likes
      WHERE position <= 3
      ORDER BY "postId", position
  `,
      [postIds],
    );

    // Добавляем к каждому посту название блога и его счётчики реакций.
    const postsWithLikes = posts.map((post) => {
      // Находим результат подсчёта именно для этого поста.
      const counts = likesCounts.find((row) => row.postId === post.id);

      return {
        ...post, // Сохраняем все поля поста.
        // Если реакций нет, строки в likesCounts не будет — используем 0.
        likesCount: Number(counts?.likesCount ?? 0),
        dislikesCount: Number(counts?.dislikesCount ?? 0),
        newestLikes: newestLikes
          .filter((like) => like.postId === post.id)
          .map(({ addedAt, userId, login }) => ({ addedAt, userId, login })),
      };
    });

    return { posts: postsWithLikes, totalCount };
  }

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostWithLikesRow> {
    // Получаем пост вместе с названием блога.
    const result = await this.dataSource.query<PostWithBlogNameAndStatusRow[]>(
      `
      SELECT p.*, b.name as "blogName", COALESCE(pl.status::text, 'None') AS "myStatus"
      FROM public.posts as p
      JOIN public.blogs as b ON b.id = p."blogId"
      LEFT JOIN public.post_likes as pl ON pl."postId" = p.id AND pl."userId" = $2
      WHERE p.id = $1
        AND p."deletedAt" IS NULL
        AND b."deletedAt" IS NULL
      `,
      [id, userId ?? null],
    );

    const post = result[0];
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
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
      FROM public.post_likes as p
      WHERE p."postId" = $1
      `,
      [id],
    );

    const newestLikes = await this.dataSource.query<NewestLikeRow[]>(
      `
      SELECT pl."updatedAt" as "addedAt", pl."userId", u.login
      FROM public.post_likes as pl 
      JOIN public.users as u ON u.id = pl."userId"
      WHERE pl."postId" = $1
      AND pl.status = 'Like'
      ORDER BY pl."updatedAt" DESC, pl.id DESC
      LIMIT 3
      `,
      [id],
    );

    return {
      ...post,
      likesCount: Number(counts[0].likesCount),
      dislikesCount: Number(counts[0].dislikesCount),
      newestLikes,
    };
  }

  async findPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PostsQueryResult> {
    // Находим неудалённый блог по ID.
    const result = await this.dataSource.query<BlogRow[]>(
      `
      SELECT * 
      FROM blogs 
      WHERE id=$1
      AND "deletedAt" IS NULL
      `,
      [blogId],
    );

    // SQL возвращает массив — берём первую запись.
    const blog = result[0];

    // Если блога нет, прекращаем выполнение и возвращаем 404.
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    // Получаем одну страницу неудалённых постов этого блога.
    const posts = await this.dataSource.query<PostWithStatusRow[]>(
      `
      SELECT p.*, COALESCE(pl.status::text, 'None') AS "myStatus"
      FROM public.posts as p
      LEFT JOIN public.post_likes AS pl ON pl."postId" = p.id AND pl."userId" = $4
      WHERE p."blogId" = $1
      AND "deletedAt" IS NULL
      ORDER BY "${query.sortBy}" ${query.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [blogId, query.pageSize, query.calculateSkip(), userId ?? null],
    );

    // Считаем ВСЕ неудалённые посты этого блога.
    // Без LIMIT и OFFSET: totalCount нужен для расчёта количества страниц.
    const totalCountResult = await this.dataSource.query<
      { totalCount: string }[]
    >(
      `
      SELECT COUNT(*) as "totalCount"
      FROM public.posts as p
      WHERE p."blogId" = $1
        AND p."deletedAt" IS NULL
      `,
      [blogId],
    );

    // dataSource.query возвращает массив строк,
    // COUNT приходит строкой — преобразуем в число.
    const totalCount = Number(totalCountResult[0].totalCount);

    // Собираем ID только тех постов, которые попали на текущую страницу.
    const postIds = posts.map((post) => post.id);

    // Одним запросом считаем лайки и дизлайки для постов страницы.
    const likesCounts = await this.dataSource.query<
      {
        postId: string;
        likesCount: string;
        dislikesCount: string;
      }[]
    >(
      `
      SELECT 
        "postId", 
        COUNT(*) FILTER (WHERE status = 'Like') as "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') as "dislikesCount"
      FROM public.post_likes
      WHERE "postId" = ANY($1::uuid[])
      GROUP BY "postId"
      `,
      [postIds],
    );
    // ANY выбирает реакции на любой ID из переданного массива.
    // GROUP BY считает реакции отдельно для каждого поста.

    // Этот запрос возвращает до трёх самых свежих лайков для каждого поста из массива postIds
    const newestLikes = await this.dataSource.query<
      (NewestLikeRow & { postId: string })[]
    >(
      `
      -- Даём промежуточной выборке имя, чтобы потом отфильтровать её по position.
      WITH ranked_likes AS (
        SELECT pl."postId",
               pl."updatedAt" AS "addedAt",
               pl."userId",
               u.login,
               
               -- Для каждого поста нумерация начинается с 1.
               -- Самый свежий лайк получает номер 1.
               ROW_NUMBER() OVER (
                 PARTITION BY pl."postId"
                 ORDER BY pl."updatedAt" DESC, pl.id DESC
               ) AS position
               
        FROM public.post_likes AS pl
        
        -- По ID пользователя, поставившего лайк, находим его логин.
        JOIN public.users AS u ON u.id = pl."userId"
        
        -- $1 — массив ID постов текущей страницы.
        WHERE pl."postId" = ANY($1::uuid[])
          AND pl.status = 'Like'
      )
      
      -- Оставляем до трёх лайков на каждый пост.
      SELECT "postId", "addedAt", "userId", login
      FROM ranked_likes
      WHERE position <= 3
      
      -- Выдаём лайки каждого поста подряд, от свежего к старому.
      ORDER BY "postId", position
  `,
      [postIds],
    );

    // Добавляем к каждому посту название блога и его счётчики реакций.
    const postsWithLikes = posts.map((post) => {
      // Находим результат подсчёта именно для этого поста.
      const counts = likesCounts.find((row) => row.postId === post.id);

      return {
        ...post, // Сохраняем все поля поста.
        blogName: blog.name,
        // Если реакций нет, строки в likesCounts не будет — используем 0.
        likesCount: Number(counts?.likesCount ?? 0),
        dislikesCount: Number(counts?.dislikesCount ?? 0),
        newestLikes: newestLikes
          .filter((like) => like.postId === post.id)
          .map(({ addedAt, userId, login }) => ({ addedAt, userId, login })),
      };
    });

    // Возвращаем посты страницы и общее количество постов блога.
    return {
      posts: postsWithLikes,
      totalCount,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogRow } from '../../../blogs/infrastructure/query/blogs-sql.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export type PostRow = {
  id: string;
  blogId: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PostWithBlogNameRow = PostRow & {
  blogName: string;
};

export type PostWithLikesRow = PostWithBlogNameRow & {
  likesCount: number;
  dislikesCount: number;
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
    const posts = await this.dataSource.query<PostWithBlogNameRow[]>(
      `
      SELECT p.id, p.title, p."shortDescription", p.content, p."createdAt", p."blogId", b.name as "blogName"
      FROM public.posts as p
      JOIN public.blogs as b ON b.id = p."blogId"
      WHERE p."deletedAt" IS NULL
        AND b."deletedAt" IS NULL
      -- Сортируем по выбранному полю и направлению.
      ORDER BY p."${query.sortBy}" ${query.sortDirection}
      LIMIT $1
      OFFSET $2
      `,
      [query.pageSize, query.calculateSkip()],
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

    // Добавляем к каждому посту название блога и его счётчики реакций.
    const postsWithLikes = posts.map((post) => {
      // Находим результат подсчёта именно для этого поста.
      const counts = likesCounts.find((row) => row.postId === post.id);

      return {
        ...post, // Сохраняем все поля поста.
        // Если реакций нет, строки в likesCounts не будет — используем 0.
        likesCount: Number(counts?.likesCount ?? 0),
        dislikesCount: Number(counts?.dislikesCount ?? 0),
      };
    });

    return { posts: postsWithLikes, totalCount };
  }

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostWithLikesRow> {
    // Получаем пост вместе с названием блога.
    const result = await this.dataSource.query<PostWithBlogNameRow[]>(
      `
      SELECT p.*, b.name as "blogName"
      FROM public.posts as p
      JOIN public.blogs as b ON b.id = p."blogId"
      WHERE p.id = $1
        AND p."deletedAt" IS NULL
        AND b."deletedAt" IS NULL
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
    return {
      ...post,
      likesCount: Number(counts[0].likesCount),
      dislikesCount: Number(counts[0].dislikesCount),
    };
  }

  // async findAllPosts(
  //   query: GetPostsQueryParams,
  //   userId?: string,
  // ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
  //   const filter: QueryFilter<Post> = { deletedAt: null };
  //
  //   const posts = await this.PostModel.find(filter)
  //     .skip(query.calculateSkip())
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .limit(query.pageSize);
  //
  //   const totalCount = await this.PostModel.countDocuments(filter);
  //
  //   const postsIds = posts.map((post) => post._id.toString());
  //
  //   const allLikesForPosts = await this.PostLikeModel.find({
  //     post_id: { $in: postsIds },
  //     status: LikeStatus.Like,
  //   }).sort({
  //     updatedAt: -1,
  //     _id: -1,
  //   });
  //
  //   const userReactions = userId
  //     ? await this.PostLikeModel.find({
  //         post_id: { $in: postsIds },
  //         user_id: userId,
  //       })
  //     : [];
  //
  //   const items = posts.map((post) => {
  //     const postId = post._id.toString();
  //
  //     const newestLikes = allLikesForPosts
  //       .filter((like) => like.post_id === postId)
  //       .slice(0, 3);
  //
  //     const userReaction = userReactions.find(
  //       (reaction) => reaction.post_id === postId,
  //     );
  //
  //     const myStatus = userReaction?.status ?? LikeStatus.None;
  //
  //     return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
  //   });
  //
  //   return PaginationViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     pageSize: query.pageSize,
  //   });
  // }

  // async getByIdOrNotFoundFail(
  //   id: string,
  //   userId?: string,
  // ): Promise<ExtendedPostViewDto> {
  //   const post = await this.PostModel.findOne({
  //     _id: id,
  //     deletedAt: null,
  //   });
  //
  //   if (!post) {
  //     throw new NotFoundException('Post not found');
  //   }
  //
  //   const userReaction = userId
  //     ? await this.PostLikeModel.findOne({ post_id: id, user_id: userId })
  //     : null;
  //
  //   const myStatus = userReaction?.status ?? LikeStatus.None;
  //
  //   // Получаем последние три реакции со статусом Like.
  //   const newestLikes = await this.PostLikeModel.find({
  //     post_id: id,
  //     status: LikeStatus.Like,
  //   })
  //     .sort({ updatedAt: -1 })
  //     .limit(3);
  //
  //   return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
  // }

  async findPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string, // Позже понадобится для реакции текущего пользователя.
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
    const posts = await this.dataSource.query<PostRow[]>(
      `
      SELECT p.*
      FROM public.posts as p
      WHERE p."blogId" = $1
      AND "deletedAt" IS NULL
      ORDER BY "${query.sortBy}" ${query.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [blogId, query.pageSize, query.calculateSkip()],
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
      };
    });

    // Возвращаем посты страницы и общее количество постов блога.
    return {
      posts: postsWithLikes,
      totalCount,
    };
  }

  // async findPostsByBlogId(
  //   blogId: string,
  //   query: GetPostsQueryParams,
  //   userId?: string,
  // ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
  //   const filter: QueryFilter<Post> = {
  //     blogId,
  //     deletedAt: null,
  //   };
  //   const posts = await this.PostModel.find(filter)
  //     .skip(query.calculateSkip())
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .limit(query.pageSize);
  //
  //   const totalCount = await this.PostModel.countDocuments(filter);
  //
  //   const postsIds = posts.map((post) => post._id.toString());
  //
  //   const allLikesForPosts = await this.PostLikeModel.find({
  //     post_id: { $in: postsIds },
  //     status: LikeStatus.Like,
  //   }).sort({
  //     updatedAt: -1,
  //     _id: -1,
  //   });
  //
  //   const userReactions = userId
  //     ? await this.PostLikeModel.find({
  //         post_id: { $in: postsIds },
  //         user_id: userId,
  //       })
  //     : [];
  //
  //   const items = posts.map((post) => {
  //     const postId = post._id.toString();
  //
  //     const newestLikes = allLikesForPosts
  //       .filter((like) => like.post_id === postId)
  //       .slice(0, 3);
  //
  //     const userReaction = userReactions.find(
  //       (reaction) => reaction.post_id === postId,
  //     );
  //
  //     const myStatus = userReaction?.status ?? LikeStatus.None;
  //
  //     return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
  //   });
  //
  //   return PaginationViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     pageSize: query.pageSize,
  //   });
  // }
}

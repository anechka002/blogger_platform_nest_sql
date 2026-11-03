import { Module } from '@nestjs/common';
import { BlogsPublicController } from './blogs/controllers/blogs.public.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/controllers/posts.controller';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { PostLike, PostLikeSchema } from './posts/domain/post-like.entity';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { CreatePostForBlogUseCase } from './blogs/application/use-cases/create-post-for-blog.use-case';
// import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { CreateCommentForPostUseCase } from './comments/application/use-cases/create-comment-for-post.use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { UpdateLikeStatusUseCase } from './comments/application/use-cases/update-like-status.use-case';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/comment-like.entity';
import { CommentLikesRepository } from './comments/infrastructure/comment-like.repository';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.use-case';
import { PostLikesRepository } from './posts/infrastructure/post-like.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/query/blogs-sql.query-repository';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs-sql.repository';
import { BlogMapper } from './blogs/api/mappers/blog.mapper';
import { PostsSqlQueryRepository } from './posts/infrastructure/query/posts-sql.query-repository';
import { PostMapper } from './posts/api/mappers/post.mapper';
import { AdminBlogsController } from './blogs/controllers/blogs.admin.controller';
import { PostsSqlRepository } from './posts/infrastructure/posts-sql.repository';
import { UpdatePostForBlogUseCase } from './blogs/application/use-cases/update-post-for-blog.use-case';
import { DeletePostForBlogUseCase } from './blogs/application/use-cases/delete-post-for-blog.use-case';
import { CommentsSqlRepository } from './comments/infrastructure/comments-sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/query/comments-sql.query-repository';
import { CommentMapper } from './comments/api/mappers/comment.mapper';
import { PostLikesSqlRepository } from './posts/infrastructure/post-like-sql.repository';
import { CommentLikesSqlRepository } from './comments/infrastructure/comment-like-sql.repository';

@Module({
  imports: [
    // CqrsModule,
    UserAccountsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  controllers: [
    BlogsPublicController,
    PostsController,
    CommentsController,
    AdminBlogsController,
  ],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,

    BlogsSqlRepository,
    BlogsSqlQueryRepository,

    BlogMapper,
    PostMapper,
    CommentMapper,

    PostsRepository,
    PostsQueryRepository,
    PostLikesRepository,

    PostsSqlQueryRepository,
    PostsSqlRepository,
    PostLikesSqlRepository,

    CommentsQueryRepository,
    CommentsRepository,
    CommentLikesRepository,

    CommentsSqlQueryRepository,
    CommentsSqlRepository,
    CommentLikesSqlRepository,

    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostForBlogUseCase,
    UpdatePostForBlogUseCase,
    DeletePostForBlogUseCase,

    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,

    CreateCommentForPostUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,

    UpdateLikeStatusUseCase,
    UpdatePostLikeStatusUseCase,
  ],
})
export class BloggersPlatformModule {}

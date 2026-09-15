import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
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
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { CreateCommentForPostUseCase } from './comments/application/use-cases/create-comment-for-post.use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,

    PostsRepository,
    PostsQueryRepository,

    CommentsQueryRepository,
    CommentsRepository,

    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostForBlogUseCase,

    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,

    CreateCommentForPostUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
  ],
})
export class BloggersPlatformModule {}

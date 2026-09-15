import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { ExtendedPostViewDto } from './view-dto/extended-post.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { CreatePostSwagger } from './swagger/create-post.swagger.decorator';
import { BasicAuthGuard } from '../../../user-accounts/users/guards/basic/basic-auth.guard';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { UpdatePostSwagger } from './swagger/update-post.swagger.decorator';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { DeletePostSwagger } from './swagger/delete-post.swagger.decorator';
import { GetPostsSwagger } from './swagger/get-posts.swagger.decorator';
import { GetPostByIdSwagger } from './swagger/get-post-by-id.swagger.decorator';
import { GetCommentsForPostSwagger } from './swagger/get-comments-for-post.swagger.decorator';
import { CommentForPostInputDto } from '../../comments/api/input-dto/comment-for-post.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/users/guards/decorators/param/extract-user-from-request.decorator';
import { CreateCommentForPostCommand } from '../../comments/application/use-cases/create-comment-for-post.use-case';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../user-accounts/users/guards/bearer/jwt-auth.guard';
import { CreateCommentForPostSwagger } from '../../comments/api/swagger/create-comment-for-blog.swagger.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {
    console.log('BlogsController');
  }

  @GetPostByIdSwagger()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ExtendedPostViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @GetPostsSwagger()
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    return this.postsQueryRepository.findAllPosts(query);
  }

  @CreatePostSwagger()
  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(
    @Body() body: CreatePostInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(body),
    );
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @UpdatePostSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.commandBus.execute<UpdatePostCommand, string>(
      new UpdatePostCommand(id, body),
    );

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @DeletePostSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }

  @GetCommentsForPostSwagger()
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    return this.commentsQueryRepository.findCommentsByPostId(postId, query);
  }

  @CreateCommentForPostSwagger()
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() body: CommentForPostInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const result = await this.commandBus.execute<
      CreateCommentForPostCommand,
      string
    >(new CreateCommentForPostCommand(user.id, postId, body));

    return this.commentsQueryRepository.getByIdOrNotFoundFail(result);
  }
}
